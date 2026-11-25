// Textos de la interfaz en los dos idiomas del sitio.
// El inglés vive en "/" y el español en "/es/". Para agregar o corregir un texto,
// editá la misma clave en los dos bloques.

export const LANGS = ['en', 'es'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

export const LANG_NAMES: Record<Lang, string> = { en: 'English', es: 'Español' };
export const DATE_LOCALES: Record<Lang, string> = { en: 'en-US', es: 'es-AR' };

const en = {
	'site.description': 'Quantum Information, Computation and Communication at ICC, Universidad de Buenos Aires',

	'nav.home': 'Home',
	'nav.projects': 'Projects',
	'nav.team': 'Team',
	'nav.news': 'News',
	'nav.publications': 'Publications',
	'nav.menu': 'Menu',
	'nav.blogSection': 'Blog',
	'nav.allNews': 'News',
	'nav.tags': 'Tags',
	'nav.archive': 'Archive',
	'a11y.search': 'Search site',
	'a11y.theme': 'Toggle dark mode',
	'a11y.menu': 'Toggle menu',
	'a11y.switchLang': 'Ver esta página en español',

	'footer.quickLinks': 'Quick Links',
	'footer.contact': 'Contact',
	'footer.rights': 'All rights reserved.',
	'footer.credit': 'Designed & Created by',
	'footer.basedOn': 'Based on Astro Scholar',

	'modal.close': 'Close',
	'modal.interests': 'Research interests',
	'modal.photo': 'Photo',
	'modal.in': 'in',

	'search.title': 'Search',

	'home.subtitle': 'Quantum Information, Computation and Communication',
	'home.introBefore': 'We are a research group focused on',
	'home.introStrong': 'quantum information science, including quantum computation and quantum communication',
	'home.viewPublications': 'View Publications',
	'home.currentProjects': 'Current Projects',
	'home.latestPublications': 'Latest Publications',
	'home.news': 'News',
	'home.viewFullList': 'View Full List',
	'home.allNews': 'View All News',
	'home.noPublications': 'No publications found.',

	'projects.metaTitle': 'Research',
	'projects.title': 'Research & Activities',
	'projects.description': 'Research and activities of the QuICC group',
	'projects.intro':
		'We conduct research at the intersection of quantum physics and computer science, while actively contributing to education, collaboration, and technology transfer.',

	'team.title': 'Team',
	'team.description': 'Research Team & Collaborators',
	'team.researcher': 'Researchers',
	'team.phd': 'PhD Students',
	'team.masters': "Master's Students",
	'team.collaborator': 'Collaborators',
	'team.former': 'Former Members',

	'pubs.title': 'Publications',
	'pubs.description': 'Academic publications of the QuICC group',
	'pubs.since': 'Publications since {year} ({count}).',
	'pubs.auto': 'Automatically generated from ORCID and arXiv.',
	'pubs.showOlder': 'Show earlier publications',
	'pubs.hideOlder': 'Hide earlier publications',
	'pubs.undated': 'Undated',

	'blog.title': 'News',
	'blog.intro': 'Explore our latest research highlights, tutorials, and announcements.',
	'blog.readMore': 'Read Article',
	'blog.none': 'No news found.',
	'blog.previous': 'Previous',
	'blog.next': 'Next',
	'blog.pageOf': 'Page {current} of {total}',
	'post.lastUpdated': 'Last updated on',
	'post.toc': 'Table of Contents',
	'post.copy': 'Copy',
	'post.copied': 'Copied',
	'post.copyLabel': 'Copy {label} code',
	'post.onlyOriginal': '',
	'post.subtitle': 'News',

	'tags.title': 'Tags',
	'tags.intro': 'Browse news by topic.',
	'tag.title': 'News tagged “{tag}”',
	'tag.intro': 'All news about this topic, newest first.',

	'archive.title': 'Archive',
	'archive.intro': 'A chronological list of all published news.',
};

type Key = keyof typeof en;

const es: Record<Key, string> = {
	'site.description': 'Quantum Information, Computation and Communication en el ICC, UBA-CONICET',

	'nav.home': 'Inicio',
	'nav.projects': 'Proyectos',
	'nav.team': 'Equipo',
	'nav.news': 'Noticias',
	'nav.publications': 'Publicaciones',
	'nav.menu': 'Menú',
	'nav.blogSection': 'Noticias',
	'nav.allNews': 'Todas las noticias',
	'nav.tags': 'Etiquetas',
	'nav.archive': 'Archivo',
	'a11y.search': 'Buscar en el sitio',
	'a11y.theme': 'Cambiar entre modo claro y oscuro',
	'a11y.menu': 'Abrir o cerrar el menú',
	'a11y.switchLang': 'View this page in English',

	'footer.quickLinks': 'Accesos rápidos',
	'footer.contact': 'Contacto',
	'footer.rights': 'Todos los derechos reservados.',
	'footer.credit': 'Diseño y desarrollo:',
	'footer.basedOn': 'Basado en Astro Scholar',

	'modal.close': 'Cerrar',
	'modal.interests': 'Temas de investigación',
	'modal.photo': 'Foto',
	'modal.in': 'en',

	'search.title': 'Buscar',

	// El nombre del grupo no se traduce
	'home.subtitle': 'Quantum Information, Computation and Communication',
	'home.introBefore': 'Somos un grupo de investigación dedicado a la',
	'home.introStrong': 'ciencia de la información cuántica, incluyendo la computación y la comunicación cuánticas',
	'home.viewPublications': 'Ver publicaciones',
	'home.currentProjects': 'Líneas de investigación',
	'home.latestPublications': 'Últimas publicaciones',
	'home.news': 'Noticias',
	'home.viewFullList': 'Ver la lista completa',
	'home.allNews': 'Ver todas las noticias',
	'home.noPublications': 'No hay publicaciones.',

	'projects.metaTitle': 'Investigación',
	'projects.title': 'Investigación y actividades',
	'projects.description': 'Investigación y actividades del grupo QuICC',
	'projects.intro':
		'Investigamos en la intersección entre la física cuántica y las ciencias de la computación, y contribuimos activamente a la formación, la colaboración y la transferencia de tecnología.',

	'team.title': 'Equipo',
	'team.description': 'Equipo de investigación y colaboradores',
	'team.researcher': 'Investigadores/as',
	'team.phd': 'Estudiantes de doctorado',
	'team.masters': 'Estudiantes de licenciatura',
	'team.collaborator': 'Colaboradores/as',
	'team.former': 'Ex integrantes',

	'pubs.title': 'Publicaciones',
	'pubs.description': 'Publicaciones académicas del grupo QuICC',
	'pubs.since': 'Publicaciones desde {year} ({count}).',
	'pubs.auto': 'Lista generada automáticamente a partir de ORCID y arXiv.',
	'pubs.showOlder': 'Mostrar publicaciones anteriores',
	'pubs.hideOlder': 'Ocultar publicaciones anteriores',
	'pubs.undated': 'Sin fecha',

	'blog.title': 'Noticias',
	'blog.intro': 'Novedades, actividades y anuncios del grupo.',
	'blog.readMore': 'Leer más',
	'blog.none': 'No hay noticias.',
	'blog.previous': 'Anterior',
	'blog.next': 'Siguiente',
	'blog.pageOf': 'Página {current} de {total}',
	'post.lastUpdated': 'Actualizado el',
	'post.toc': 'Contenido',
	'post.copy': 'Copiar',
	'post.copied': 'Copiado',
	'post.copyLabel': 'Copiar el código {label}',
	'post.onlyOriginal': 'Esta noticia está disponible solo en inglés.',
	'post.subtitle': 'Noticia',

	'tags.title': 'Etiquetas',
	'tags.intro': 'Noticias por tema.',
	'tag.title': 'Noticias sobre “{tag}”',
	'tag.intro': 'Todas las noticias sobre este tema, de la más reciente a la más antigua.',

	'archive.title': 'Archivo',
	'archive.intro': 'Todas las noticias publicadas, en orden cronológico.',
};

const STRINGS: Record<Lang, Record<Key, string>> = { en, es };

/** Texto de la interfaz; {nombre} se reemplaza por vars.nombre. */
export function t(lang: Lang, key: Key, vars: Record<string, string | number> = {}): string {
	const text = STRINGS[lang]?.[key] ?? en[key];
	return text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
}

const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Quita la base del sitio y devuelve el idioma y la ruta "sin idioma" (siempre empieza con /). */
export function splitPath(pathname: string): { lang: Lang; path: string } {
	let path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
	if (!path.startsWith('/')) path = `/${path}`;
	if (path === '/es' || path.startsWith('/es/')) {
		return { lang: 'es', path: path.slice(3) || '/' };
	}
	return { lang: 'en', path };
}

/** Ruta del sitio en un idioma: localePath('es', '/team') → '/es/team'. */
export function localePath(lang: Lang, path: string): string {
	if (/^(https?:|mailto:|tel:)/.test(path)) return path;
	const clean = path.startsWith('/') ? path : `/${path}`;
	const prefix = lang === DEFAULT_LANG ? '' : `/${lang}`;
	const full = clean === '/' ? `${prefix}/` : `${prefix}${clean}`;
	return `${base}${full}`;
}

/** La misma página en el otro idioma (todas las páginas existen en los dos, salvo la 404). */
export function alternatePath(pathname: string, to: Lang): string {
	const { path } = splitPath(pathname);
	return localePath(to, /^\/404(\.html)?\/?$/.test(path) ? '/' : path);
}

export function langFromUrl(url: URL): Lang {
	return splitPath(url.pathname).lang;
}

export function formatDate(date: Date, lang: Lang, options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }) {
	return date.toLocaleDateString(DATE_LOCALES[lang], options);
}
