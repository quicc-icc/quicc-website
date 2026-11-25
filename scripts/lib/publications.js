// Funciones puras para normalizar, unificar y ordenar publicaciones.
// No hacen pedidos de red: las usa scripts/fetch-publications.js.
//
// Formato de cada publicación en src/data/publications.json:
//   title, year, authors[], venue,
//   doi    → DOI de la versión publicada (nunca el DOI de arXiv),
//   arxiv  → https://arxiv.org/abs/<id> (sin número de versión),
//   url    → link principal: el DOI si existe; si no, arXiv.

export const ARXIV_VENUE = "arXiv preprint";

// =========================
// arXiv
// =========================
const ARXIV_DOI_PREFIX = "10.48550/arxiv.";
// IDs nuevos (2309.12399) y viejos (quant-ph/0101001)
const ARXIV_ID_RE = /((?:\d{4}\.\d{4,5})|(?:[a-z-]+(?:\.[A-Z]{2})?\/\d{7}))(?:v\d+)?/i;

export function isArxivDoi(doi) {
  return Boolean(doi) && doi.toLowerCase().startsWith(ARXIV_DOI_PREFIX);
}

// DOIs de servidores de preprints (no son la versión publicada)
const PREPRINT_DOI_PREFIXES = [
  ARXIV_DOI_PREFIX,
  "10.2139/ssrn.", // SSRN
  "10.21203/rs.", // Research Square
  "10.20944/preprints", // Preprints.org
  "10.36227/techrxiv", // TechRxiv
  "10.22541/au.", // Authorea
  "10.31234/osf.", // PsyArXiv
  "10.31219/osf.", // OSF Preprints
];

export function isPreprintDoi(doi) {
  const d = (doi || "").toLowerCase();
  return PREPRINT_DOI_PREFIXES.some((p) => d.startsWith(p));
}

/** DOI de la versión publicada (null si no hay o si es de un servidor de preprints). */
export function journalDoi(pub) {
  return pub.doi && !isPreprintDoi(pub.doi) ? pub.doi : null;
}

/** ¿Es un preprint? (sin DOI de revista y con venue, DOI o ID de servidor de preprints) */
export function isPreprint(pub) {
  return (
    !journalDoi(pub) &&
    (isPreprintVenue(pub.venue) || isPreprintDoi(pub.doi) || Boolean(arxivIdOf(pub)))
  );
}

function cleanArxivId(raw) {
  const m = String(raw || "").match(ARXIV_ID_RE);
  return m ? m[1] : null;
}

export function arxivUrl(id) {
  return `https://arxiv.org/abs/${id}`;
}

/** Devuelve el ID de arXiv de una publicación, si se puede deducir. */
export function arxivIdOf(pub) {
  if (pub.arxiv) return cleanArxivId(pub.arxiv.split("/abs/").pop());
  if (isArxivDoi(pub.doi)) return cleanArxivId(pub.doi.slice(ARXIV_DOI_PREFIX.length));
  if (pub.url && /arxiv\.org\/abs\//i.test(pub.url)) return cleanArxivId(pub.url.split("/abs/").pop());
  if (pub.url && isArxivDoi(pub.url.replace(/^https?:\/\/(dx\.)?doi\.org\//i, ""))) {
    return cleanArxivId(pub.url.split(/arxiv\./i).pop());
  }
  const venueMatch = (pub.venue || "").match(/arxiv[:\s]*((?:\d{4}\.\d{4,5}))/i);
  if (venueMatch) return venueMatch[1];
  return null;
}

/** ¿El venue es en realidad "preprint de arXiv" o vacío? */
export function isPreprintVenue(venue) {
  const v = (venue || "").trim().toLowerCase();
  return v === "" || v === "preprint" || v.startsWith("arxiv") || v === "corr";
}

// =========================
// Feed Atom de arXiv (https://arxiv.org/a/<ORCID>.atom2)
// =========================
function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return m ? decodeEntities(m[1]).replace(/\s+/g, " ").trim() : null;
}

/** Convierte el feed atom2 de arXiv en publicaciones con el formato del sitio. */
export function parseArxivFeed(xml) {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  return entries
    .map((entry) => {
      const id = cleanArxivId((tag(entry, "id") || "").split("/abs/").pop());
      if (!id) return null;

      const journalDoi = (tag(entry, "arxiv:doi") || "").toLowerCase() || null;
      const journalRef = tag(entry, "arxiv:journal_ref");
      const published = tag(entry, "published") || "";
      // atom2 trae todos los autores en un único <name>, separados por coma
      const authors = (tag(entry, "name") || "")
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      return {
        title: tag(entry, "title") || "No title",
        year: parseInt(published.slice(0, 4), 10) || 0,
        authors,
        // la revista exacta la completa el registro de ORCID o Crossref;
        // acá sólo queda la referencia que cargaron los autores en arXiv
        venue: journalRef || ARXIV_VENUE,
        doi: journalDoi && !isArxivDoi(journalDoi) ? journalDoi : null,
        arxiv: arxivUrl(id),
        url: null,
        source: "arxiv",
      };
    })
    .filter(Boolean);
}

// =========================
// Autores
// =========================
function strip(s) {
  return s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Clave "apellido|iniciales" para detectar el mismo autor escrito distinto:
 * "Bosyk, G.M.", "G. M. Bosyk" → bosyk|gm. Usa todas las iniciales para no
 * confundir, por ejemplo, a "A. Plastino" (a) con "A. R. Plastino" (ar).
 */
function authorKey(name) {
  let last;
  let first;
  if (name.includes(",")) {
    [last, first] = name.split(",", 2);
  } else {
    const parts = name.trim().split(/\s+/);
    last = parts.pop() || "";
    first = parts.join(" ");
  }
  const initials = (first || "")
    .split(/[\s.\-]+/)
    .filter(Boolean)
    .map((p) => {
      // "GM" o "G.M." pegados → varias iniciales
      if (p.length <= 3 && p === p.toUpperCase()) return p;
      return p[0];
    })
    .join("");
  return `${strip(last).replace(/[^a-z]/g, "")}|${strip(initials).replace(/[^a-z]/g, "")}`;
}

/** "Bosyk, G.M." → "G. M. Bosyk"; "Cifuentes, Santiago" → "Santiago Cifuentes". */
export function displayName(name) {
  if (!name.includes(",")) return name;
  const [last, first] = name.split(",", 2).map((p) => p.trim());
  if (!first) return last;
  // sólo iniciales ("G.M.", "GM", "G. M.") → "G. M."
  const spaced = /^([A-Z]\.?\s*)+$/.test(first)
    ? first.replace(/[^A-Z]/g, "").split("").map((c) => `${c}.`).join(" ")
    : first;
  return `${spaced} ${last}`;
}

/** Quita autores repetidos con distinto formato, conservando la forma más completa. */
export function dedupeAuthors(authors = []) {
  const byKey = new Map();
  const order = [];
  for (const name of authors) {
    const clean = name.replace(/\s+/g, " ").trim();
    if (!clean) continue;
    const key = authorKey(clean);
    if (!byKey.has(key)) {
      byKey.set(key, clean);
      order.push(key);
    } else if (!clean.includes(",") && clean.length > byKey.get(key).length) {
      byKey.set(key, clean); // preferir "Marcelo Losada" a "Losada, M."
    }
  }
  return order.map((k) => displayName(byKey.get(k)));
}

function surnames(authors = []) {
  return new Set(authors.map((a) => authorKey(a).split("|")[0]).filter(Boolean));
}

// =========================
// Unificar duplicados
// =========================
export function normalizeTitle(title) {
  return strip(title || "").replace(/[^a-z0-9]/g, "");
}

/** Lleva una publicación (de ORCID o del JSON existente) al formato normalizado. */
export function normalizePub(pub) {
  const id = arxivIdOf(pub);
  const doi = pub.doi && !isArxivDoi(pub.doi) ? pub.doi.toLowerCase() : null;
  return {
    ...pub,
    year: Number(pub.year) || 0,
    doi,
    arxiv: id ? arxivUrl(id) : null,
    venue: !doi && id && isPreprintVenue(pub.venue) ? ARXIV_VENUE : pub.venue,
  };
}

function pickPrimary(records) {
  // 1) versión publicada con revista conocida, 2) con DOI de revista,
  // 3) la entrada del feed de arXiv, 4) cualquiera
  return (
    records.find((r) => journalDoi(r) && !isPreprintVenue(r.venue)) ||
    records.find((r) => journalDoi(r)) ||
    records.find((r) => r.source === "arxiv") ||
    records[0]
  );
}

function mergeCluster(records) {
  const primary = pickPrimary(records);
  const fromArxiv = records.find((r) => r.source === "arxiv");
  const published = Boolean(journalDoi(primary));

  const arxivId = records.map(arxivIdOf).find(Boolean);
  // DOI de la revista; si es sólo preprint, el DOI del servidor (p. ej. SSRN), si lo hay
  const doi =
    journalDoi(primary) ||
    records.map(journalDoi).find(Boolean) ||
    records.map((r) => r.doi).find(Boolean) ||
    null;

  // título: el de la versión publicada; si es sólo preprint, el de la última versión en arXiv
  const title = published ? primary.title : (fromArxiv || primary).title;

  // año: el de la versión publicada; si es preprint, el del primer envío a arXiv
  const year = published
    ? primary.year || Math.max(...records.map((r) => r.year || 0))
    : (fromArxiv || primary).year || Math.min(...records.map((r) => r.year || 9999).filter((y) => y < 9999));

  // venue: la revista; si no hay, la referencia cargada en arXiv; si no, "arXiv preprint"
  const venue = published
    ? (!isPreprintVenue(primary.venue) ? primary.venue : records.map((r) => r.venue).find((v) => !isPreprintVenue(v)) || primary.venue)
    : arxivId
      ? ARXIV_VENUE // preprint en arXiv
      : primary.venue; // otro preprint, o actas sin DOI: se respeta lo que había

  // autores: la lista de arXiv (completa y en orden); si no, la más larga, sin repetidos
  const authors = dedupeAuthors(
    fromArxiv?.authors?.length
      ? fromArxiv.authors
      : records.reduce((best, r) => ((r.authors || []).length > best.length ? r.authors : best), [])
  );

  return {
    title,
    year: Number.isFinite(year) ? year : 0,
    authors,
    venue,
    doi,
    arxiv: arxivId ? arxivUrl(arxivId) : null,
    url:
      published || (doi && !arxivId)
        ? `https://doi.org/${doi}`
        : arxivId
          ? arxivUrl(arxivId)
          : primary.url || null,
  };
}

/** Une los duplicados y devuelve una publicación por trabajo. */
export function mergeAll(pubs) {
  // Se repite hasta que no haya más uniones, para que correr el script dos veces
  // dé exactamente el mismo resultado.
  let current = pubs;
  for (let i = 0; i < 5; i++) {
    const next = clusterPubs(current).map(mergeCluster);
    if (next.length === current.length && i > 0) return next;
    current = next;
  }
  return current;
}

/**
 * Agrupa registros que son el mismo trabajo: mismo DOI de revista, mismo ID de
 * arXiv, o mismo título con al menos un apellido en común.
 */
export function clusterPubs(pubs) {
  const records = pubs.map(normalizePub);
  const parent = records.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const union = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };

  const firstByKey = new Map();
  const link = (key, i) => {
    if (!key) return;
    if (firstByKey.has(key)) union(firstByKey.get(key), i);
    else firstByKey.set(key, i);
  };

  records.forEach((r, i) => {
    link(r.doi && `doi:${r.doi}`, i);
    link(arxivIdOf(r) && `arxiv:${arxivIdOf(r)}`, i);
  });

  // mismo título: sólo si comparten algún apellido (o alguno no tiene autores)
  // y al menos uno de los dos es un preprint
  const byTitle = new Map();
  records.forEach((r, i) => {
    const t = normalizeTitle(r.title);
    if (t.length < 12) return; // títulos muy cortos o "No title": no se usan
    if (!byTitle.has(t)) byTitle.set(t, []);
    byTitle.get(t).push(i);
  });
  for (const idxs of byTitle.values()) {
    for (let a = 0; a < idxs.length; a++) {
      for (let b = a + 1; b < idxs.length; b++) {
        const sa = surnames(records[idxs[a]].authors);
        const sb = surnames(records[idxs[b]].authors);
        const shared = sa.size === 0 || sb.size === 0 || [...sa].some((s) => sb.has(s));
        // la versión de un congreso y la de una revista son publicaciones distintas:
        // por título sólo se une si al menos uno de los dos es un preprint
        const onePreprint = isPreprint(records[idxs[a]]) || isPreprint(records[idxs[b]]);
        if (shared && onePreprint) union(idxs[a], idxs[b]);
      }
    }
  }

  const clusters = new Map();
  records.forEach((r, i) => {
    const root = find(i);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root).push(r);
  });

  return [...clusters.values()];
}

/** Saca las publicaciones listadas en publications-exclude.json (DOI, ID de arXiv o título). */
export function applyExclusions(pubs, exclude = []) {
  const keys = new Set(
    exclude.map((e) => String(e).trim().toLowerCase()).filter(Boolean)
  );
  const titles = new Set(exclude.map((e) => normalizeTitle(String(e))).filter((t) => t.length >= 12));
  return pubs.filter((p) => {
    const id = arxivIdOf(p);
    return !(
      (p.doi && keys.has(p.doi)) ||
      (id && keys.has(id.toLowerCase())) ||
      titles.has(normalizeTitle(p.title))
    );
  });
}

export function sortPubs(pubs) {
  return [...pubs].sort(
    (a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title)
  );
}
