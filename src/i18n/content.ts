// Contenido en los dos idiomas: datos de src/data/ y noticias.
// Regla general: si falta la versión en español de algo, se muestra en inglés.

import { getCollection, type CollectionEntry } from 'astro:content';
import terms from './terms.json';
import { t, type Lang } from './ui';

const TERMS_ES = new Map(Object.entries(terms.es).map(([en, es]) => [en.trim().toLowerCase(), es]));

/** Traduce un término de terms.json ("Physics" → "Física"); si no está, lo deja como está. */
export function term(text: string | undefined | null, lang: Lang): string {
	if (!text) return '';
	if (lang === 'en') return text;
	const hit = TERMS_ES.get(text.trim().toLowerCase());
	if (!hit) return text;
	// las etiquetas van en minúscula: "quantum information" → "información cuántica"
	return text === text.toLowerCase() ? hit.toLowerCase() : hit;
}

export function hasTerm(text: string): boolean {
	return TERMS_ES.has(text.trim().toLowerCase());
}

/** Campo con versión opcional en español: field(item, 'title', 'es') usa title_es si existe. */
export function field<T extends Record<string, any>>(item: T, name: string, lang: Lang): any {
	const translated = lang === 'es' ? item[`${name}_es`] : undefined;
	const isEmpty = translated == null || translated === '' || (Array.isArray(translated) && translated.length === 0);
	return isEmpty ? item[name] : translated;
}

/** Quita los campos *_es para no repetirlos en el HTML. */
function withoutTranslations<T extends Record<string, any>>(item: T): T {
	return Object.fromEntries(Object.entries(item).filter(([key]) => !key.endsWith('_es'))) as T;
}

export type LocalizedMember = Record<string, any> & {
	name: string;
	role: string;
	program: string;
	degree: string;
	keywords: string[];
	positions?: string[];
	bio?: string;
	affiliation?: string;
	roleLine: string;
};

/**
 * Integrante de authors.json en el idioma pedido. Para el rol, la carrera, el título
 * y las palabras clave se usa el campo *_es si existe y, si no, terms.json.
 * Los cargos (positions) y la bio sólo se traducen con positions_es / bio_es.
 */
export function localizeMember(member: Record<string, any>, lang: Lang): LocalizedMember {
	// campo_es si está cargado; si no, la traducción de terms.json; si no, el inglés
	const pickOrTerm = (name: string): string => {
		const translated = lang === 'es' ? member[`${name}_es`] : undefined;
		return translated ? translated : term(member[name], lang);
	};
	const role = pickOrTerm('role');
	const program = pickOrTerm('program');
	const degree = pickOrTerm('degree');
	const keywordsEs = lang === 'es' ? member.keywords_es : undefined;
	const keywords: string[] = keywordsEs?.length ? keywordsEs : (member.keywords ?? []).map((k: string) => term(k, lang));

	return {
		...withoutTranslations(member),
		name: member.name,
		role,
		program,
		degree,
		keywords,
		positions: field(member, 'positions', lang),
		bio: field(member, 'bio', lang),
		affiliation: field(member, 'affiliation', lang),
		// "PhD Student in Computer Science" / "Estudiante de doctorado en Ciencias de la Computación"
		roleLine: program ? `${role} ${t(lang, 'modal.in')} ${program}` : role,
	};
}

// =========================
// Noticias
// =========================

export interface LocalizedPost {
	id: string;
	data: CollectionEntry<'blog'>['data'];
	/** Entrada que se renderiza: la traducción si existe, si no el original en inglés. */
	entry: CollectionEntry<'blog'> | CollectionEntry<'blogEs'>;
	/** false si la página en español muestra el texto original en inglés. */
	translated: boolean;
}

/**
 * Noticias en el idioma pedido, de la más nueva a la más vieja. En español se usa
 * src/content/blog-es/<mismo nombre>.mdx si existe; la fecha, la imagen y las
 * etiquetas salen siempre de la noticia original.
 */
export async function getPosts(lang: Lang): Promise<LocalizedPost[]> {
	const posts = await getCollection('blog');
	const translations =
		lang === 'es' ? new Map((await getCollection('blogEs')).map((entry) => [entry.id, entry])) : new Map();

	return posts
		.map((post) => {
			const tr = translations.get(post.id);
			return {
				id: post.id,
				data: tr
					? {
							...post.data,
							title: tr.data.title,
							description: tr.data.description,
							updatedDate: tr.data.updatedDate ?? post.data.updatedDate,
						}
					: post.data,
				entry: tr ?? post,
				translated: lang === 'en' || Boolean(tr),
			};
		})
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
