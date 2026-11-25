// Al terminar cada build, lista lo que todavía no tiene versión en español.
// No frena nada: el sitio muestra el inglés cuando falta una traducción.
// En GitHub Actions el resumen aparece como aviso en la corrida del deploy.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf-8'));
const posts = (dir) =>
	fs.existsSync(path.join(ROOT, dir))
		? fs
				.readdirSync(path.join(ROOT, dir))
				.filter((f) => /\.mdx?$/.test(f))
				.map((f) => f.replace(/\.mdx?$/, ''))
		: [];

export function missingTranslations() {
	const terms = new Set(Object.keys(read('src/i18n/terms.json').es).map((k) => k.toLowerCase()));
	const known = (text) => !text || terms.has(text.trim().toLowerCase());
	const lines = [];

	const en = posts('src/content/blog');
	const es = new Set(posts('src/content/blog-es'));
	const untranslated = en.filter((id) => !es.has(id));
	if (untranslated.length) lines.push(`Noticias sin traducir (src/content/blog-es/): ${untranslated.join(', ')}`);
	const orphans = [...es].filter((id) => !en.includes(id));
	if (orphans.length) lines.push(`Traducciones sin noticia original (revisar el nombre del archivo): ${orphans.join(', ')}`);

	for (const m of read('src/data/authors.json')) {
		const missing = [];
		if (m.role && !m.role_es && !known(m.role)) missing.push('role_es');
		if (m.program && !m.program_es && !known(m.program)) missing.push('program_es');
		if (m.degree && !m.degree_es && !known(m.degree)) missing.push('degree_es');
		if (m.positions?.length && !m.positions_es?.length) missing.push('positions_es');
		if (m.bio && !m.bio_es) missing.push('bio_es');
		const kw = (m.keywords || []).filter((k) => !known(k));
		if (kw.length && !m.keywords_es?.length) missing.push(`keywords_es (o agregar a terms.json: ${kw.join(', ')})`);
		if (missing.length) lines.push(`authors.json, ${m.name}: falta ${missing.join(', ')}`);
	}

	for (const section of read('src/data/projects.json')) {
		const items = [section, ...(section.items || [])].filter((item) => !item.title_es || (item.description && !item.description_es));
		for (const item of items) lines.push(`projects.json: falta title_es / description_es en "${item.title}"`);
	}

	return lines;
}

export default function i18nReport() {
	return {
		name: 'quicc-i18n-report',
		hooks: {
			'astro:build:done': ({ logger }) => {
				const lines = missingTranslations();
				if (!lines.length) {
					logger.info('Versión en español completa.');
					return;
				}
				logger.info(`Textos que se muestran en inglés en la versión en español (${lines.length}):`);
				for (const line of lines) logger.info(`  - ${line}`);
				if (process.env.GITHUB_ACTIONS) {
					console.log(`::notice title=Traducciones pendientes::${lines.join(' | ')}`);
				}
			},
		},
	};
}
