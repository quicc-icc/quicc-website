// Pruebas de la lógica de publicaciones: npm test
// Corren en cada pull request y antes de cada actualización semanal.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseArxivFeed,
  mergeAll,
  applyExclusions,
  sortPubs,
  displayName,
  dedupeAuthors,
  isPreprint,
  crossrefFields,
  needsCrossref,
  fillMissing,
} from "./publications.js";

const journal = (extra = {}) => ({
  title: "Majorization and quantum resources",
  year: 2024,
  authors: ["Gustavo M. Bosyk", "Guido Bellomo"],
  venue: "Physical Review A",
  doi: "10.1103/physreva.1.000001",
  arxiv: null,
  url: "https://doi.org/10.1103/physreva.1.000001",
  ...extra,
});

const arxivRecord = (extra = {}) => ({
  title: "Majorization and quantum resources",
  year: 2023,
  authors: ["Gustavo M. Bosyk", "Guido Bellomo", "Third Author"],
  venue: "arXiv preprint",
  doi: null,
  arxiv: "https://arxiv.org/abs/2301.00001",
  url: null,
  source: "arxiv",
  ...extra,
});

test("el feed de arXiv se convierte al formato del sitio", () => {
  const xml = `<feed><entry>
    <id>http://arxiv.org/abs/2301.00001v2</id>
    <published>2023-01-02T00:00:00Z</published>
    <title>Majorization &amp; quantum
      resources</title>
    <author><name>Gustavo M. Bosyk, Guido Bellomo</name></author>
    <arxiv:doi>10.1103/PhysRevA.1.000001</arxiv:doi>
    <arxiv:journal_ref>Phys. Rev. A 1, 000001 (2024)</arxiv:journal_ref>
  </entry></feed>`;
  const [pub] = parseArxivFeed(xml);
  assert.equal(pub.title, "Majorization & quantum resources");
  assert.equal(pub.year, 2023);
  assert.deepEqual(pub.authors, ["Gustavo M. Bosyk", "Guido Bellomo"]);
  assert.equal(pub.arxiv, "https://arxiv.org/abs/2301.00001");
  assert.equal(pub.doi, "10.1103/physreva.1.000001");
});

test("un preprint y su versión publicada quedan como una sola entrada", () => {
  const merged = mergeAll([journal(), arxivRecord({ doi: "10.1103/physreva.1.000001" })]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].venue, "Physical Review A");
  assert.equal(merged[0].arxiv, "https://arxiv.org/abs/2301.00001");
  assert.equal(merged[0].url, "https://doi.org/10.1103/physreva.1.000001");
});

test("por título se une un preprint con la versión publicada", () => {
  const merged = mergeAll([journal(), arxivRecord()]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].doi, "10.1103/physreva.1.000001");
});

test("la versión de un congreso y la de una revista no se unen", () => {
  const conference = journal({
    year: 2022,
    venue: "Proceedings of a conference",
    doi: "10.1007/978-3-000-00000-0_1",
    url: "https://doi.org/10.1007/978-3-000-00000-0_1",
  });
  assert.equal(mergeAll([journal(), conference]).length, 2);
});

test("un DOI de SSRN cuenta como preprint, no como revista", () => {
  assert.equal(isPreprint({ title: "x", doi: "10.2139/ssrn.123456", venue: "SSRN" }), true);
});

test("correr la unión dos veces da el mismo resultado", () => {
  const once = mergeAll([journal(), arxivRecord(), arxivRecord({ title: "Another paper", arxiv: "https://arxiv.org/abs/2302.00002" })]);
  assert.deepEqual(mergeAll(once), once);
});

test("nombres de autores", () => {
  assert.equal(displayName("Bosyk, G.M."), "G. M. Bosyk");
  assert.equal(displayName("Cifuentes, Santiago"), "Santiago Cifuentes");
  // A. Plastino y A. R. Plastino son personas distintas
  assert.equal(dedupeAuthors(["A. Plastino", "A. R. Plastino"]).length, 2);
  assert.deepEqual(dedupeAuthors(["Losada, M.", "Marcelo Losada"]), ["Marcelo Losada"]);
});

test("la lista de exclusión acepta DOI, ID de arXiv o título", () => {
  const pubs = [journal(), arxivRecord({ title: "Another paper", arxiv: "https://arxiv.org/abs/2302.00002" })];
  assert.equal(applyExclusions(pubs, ["10.1103/PhysRevA.1.000001"]).length, 1);
  assert.equal(applyExclusions(pubs, ["2302.00002"]).length, 1);
  assert.equal(applyExclusions(pubs, ["Another paper title that is long"]).length, 2);
});

test("orden: más recientes primero, sin año al final", () => {
  const sorted = sortPubs([journal({ year: 0, title: "B" }), journal({ year: 2020, title: "A" }), journal({ year: 2025, title: "C" })]);
  assert.deepEqual(sorted.map((p) => p.year), [2025, 2020, 0]);
});

test("Crossref completa sólo lo que falta", () => {
  const info = crossrefFields({
    "container-title": ["Physics Letters A"],
    issued: { "date-parts": [[2011, 9]] },
    author: [{ given: "Ana", family: "Pérez" }, { name: "Some Consortium" }],
  });
  assert.deepEqual(info, { venue: "Physics Letters A", year: 2011, authors: ["Ana Pérez", "Some Consortium"] });

  const incomplete = { title: "Noise", year: 0, authors: [], venue: "Physics Letters A", doi: "10.1016/x" };
  assert.equal(needsCrossref(incomplete), true);
  assert.deepEqual(fillMissing(incomplete, info), { year: 2011, authors: ["Ana Pérez", "Some Consortium"] });

  assert.equal(needsCrossref(journal()), false);
  assert.deepEqual(fillMissing(journal(), info), {});
});
