# QuICC Website

Official website of the Quantum Information, Computation and Communication (QuICC) group at the Instituto de Ciencias de la Computación (ICC, UBA-CONICET).

**Live site:** https://quicc.dc.uba.ar

## How it works

- Built with [Astro](https://astro.build) and published on GitHub Pages every time `main` changes.
- The publication list is updated automatically every week from ORCID, arXiv and Crossref (see `.github/workflows/update-publications.yml`).
- Team members, projects and news live in `src/data/` and `src/content/blog/`.

## Local development

Requires Node.js 22.12 or later.

```sh
npm ci
npm run dev      # local preview at http://localhost:4321
npm test         # checks for the publication scripts
npm run build    # production build in dist/
```

## Contributing

See [contributing.md](./contributing.md) for how to add news, team members, projects and publications.
