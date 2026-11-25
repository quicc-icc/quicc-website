// Actualiza src/data/publications.json a partir de:
//   1. ORCID de cada integrante (src/data/orcids.json)
//   2. el feed de arXiv de cada ORCID (https://arxiv.org/a/<ORCID>.atom2), que sólo
//      existe si la persona vinculó su ORCID en su cuenta de arXiv
// Une duplicados (preprint / versión publicada), y respeta
// src/data/publications-exclude.json. Lo que ya estaba en el JSON se conserva.

import fs from "fs/promises";
import {
  parseArxivFeed,
  mergeAll,
  applyExclusions,
  sortPubs,
  isPreprintVenue,
} from "./lib/publications.js";

const DATA = "./src/data";
const USER_AGENT = "QuICC-website/1.0 (+https://quicc.dc.uba.ar; publications updater)";
const ARXIV_PAUSE_MS = 3000; // arXiv pide no más de un pedido cada 3 segundos

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const problems = [];

async function readJson(path, fallback) {
  try {
    return JSON.parse(await fs.readFile(path, "utf-8"));
  } catch {
    return fallback;
  }
}

async function request(url, accept) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await fetch(url, {
      headers: { Accept: accept, "User-Agent": USER_AGENT },
    });
    // límite de pedidos o servicio caído: esperar y reintentar una vez
    if ((res.status === 429 || res.status === 503) && attempt === 1) {
      await sleep(15000);
      continue;
    }
    return res;
  }
}

// =========================
// ORCID
// =========================
async function orcidJson(url) {
  const res = await request(url, "application/json");
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.json();
}

function extractAuthors(contributors) {
  return (contributors || []).map((c) => c["credit-name"]?.value).filter(Boolean);
}

function extractId(externalIds, ...types) {
  const id = externalIds?.["external-id"]?.find((e) =>
    types.includes(String(e["external-id-type"]).toLowerCase())
  );
  return id ? String(id["external-id-value"]).trim() : null;
}

function extractVenue(work) {
  return (
    work["journal-title"]?.value ||
    work["book-title"]?.value ||
    work["publisher"]?.value ||
    "Preprint"
  );
}

async function fetchOrcid(researcher) {
  const base = `https://pub.orcid.org/v3.0/${researcher.orcid}`;
  const data = await orcidJson(`${base}/works`);
  const summaries = (data.group || []).map((g) => g["work-summary"][0]);
  const pubs = [];

  for (const summary of summaries) {
    try {
      const details = await orcidJson(`${base}/work/${summary["put-code"]}`);
      const doi = extractId(details["external-ids"], "doi");
      const arxivId = extractId(details["external-ids"], "arxiv");

      pubs.push({
        title: details.title?.title?.value || "No title",
        year: parseInt(details["publication-date"]?.year?.value, 10) || 0,
        authors: extractAuthors(details.contributors?.contributor),
        venue: extractVenue(details),
        doi: doi ? doi.toLowerCase() : null,
        arxiv: arxivId ? `https://arxiv.org/abs/${arxivId}` : null,
        url: doi ? `https://doi.org/${doi.toLowerCase()}` : null,
      });
    } catch (err) {
      problems.push(`ORCID ${researcher.name}, trabajo ${summary["put-code"]}: ${err.message}`);
    }
  }

  console.log(`  ORCID: ${pubs.length} trabajos.`);
  return pubs;
}

// =========================
// arXiv
// =========================
async function fetchArxiv(researcher) {
  const url = `https://arxiv.org/a/${researcher.orcid}.atom2`;
  const res = await request(url, "application/atom+xml");

  // 404 = la persona todavía no vinculó su ORCID en arXiv; no es un error
  if (res.status === 404) {
    console.log("  arXiv: sin feed (ORCID no vinculado en arXiv).");
    return [];
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);

  const pubs = parseArxivFeed(await res.text());
  console.log(`  arXiv: ${pubs.length} artículos.`);
  return pubs;
}

// =========================
// Crossref: nombre de la revista cuando ORCID no lo trae
// =========================
async function venueFromCrossref(doi) {
  const res = await request(
    `https://api.crossref.org/works/${encodeURIComponent(doi)}`,
    "application/json"
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.message?.["container-title"]?.[0] || null;
}

// =========================
// Principal
// =========================
const existing = await readJson(`${DATA}/publications.json`, []);
const researchers = await readJson(`${DATA}/orcids.json`, []);
const exclude = await readJson(`${DATA}/publications-exclude.json`, []);

const incoming = [];
for (const [i, researcher] of researchers.entries()) {
  console.log(`== ${researcher.name} (${researcher.orcid})`);

  try {
    incoming.push(...(await fetchOrcid(researcher)));
  } catch (err) {
    problems.push(`ORCID ${researcher.name}: ${err.message}`);
  }

  if (i > 0) await sleep(ARXIV_PAUSE_MS);
  try {
    incoming.push(...(await fetchArxiv(researcher)));
  } catch (err) {
    problems.push(`arXiv ${researcher.name}: ${err.message}`);
  }
}

let publications = mergeAll([...existing, ...incoming]);

for (const pub of publications) {
  if (pub.doi && isPreprintVenue(pub.venue)) {
    try {
      const venue = await venueFromCrossref(pub.doi);
      if (venue) pub.venue = venue;
    } catch (err) {
      problems.push(`Crossref ${pub.doi}: ${err.message}`);
    }
  }
}

const merged = publications.length;
publications = sortPubs(applyExclusions(publications, exclude));

await fs.writeFile(
  `${DATA}/publications.json`,
  JSON.stringify(publications, null, 2) + "\n"
);

console.log(
  `\nPublicaciones: ${existing.length} antes → ${publications.length} ahora` +
    ` (${merged - publications.length} excluidas).`
);

// Los problemas quedan como aviso en el resumen de GitHub Actions, sin cortar la actualización.
for (const problem of problems) {
  console.log(process.env.GITHUB_ACTIONS ? `::warning::${problem}` : `AVISO: ${problem}`);
}
