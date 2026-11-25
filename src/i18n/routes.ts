// Rutas dinámicas de noticias y etiquetas, compartidas por las páginas en inglés
// (src/pages/...) y en español (src/pages/es/...).

import { getPosts, type LocalizedPost } from './content';
import type { Lang } from './ui';

export const NEWS_PAGE_SIZE = 4;

export async function postPaths(lang: Lang) {
	const posts = await getPosts(lang);
	return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export async function newsPagePaths(lang: Lang) {
	const posts = await getPosts(lang);
	const totalPages = Math.max(1, Math.ceil(posts.length / NEWS_PAGE_SIZE));
	return Array.from({ length: totalPages }, (_, index) => {
		const page = index + 1;
		return {
			params: { page: page === 1 ? undefined : String(page) },
			props: {
				posts: posts.slice(index * NEWS_PAGE_SIZE, page * NEWS_PAGE_SIZE),
				currentPage: page,
				totalPages,
				nextPage: page < totalPages ? page + 1 : null,
				prevPage: page > 1 ? page - 1 : null,
			},
		};
	});
}

export function allTags(posts: LocalizedPost[]): string[] {
	return [...new Set(posts.flatMap((post) => post.data.tags || []))].sort();
}

export async function tagPaths(lang: Lang) {
	const posts = await getPosts(lang);
	return allTags(posts).map((tag) => ({
		params: { tag },
		props: { posts: posts.filter((post) => post.data.tags?.includes(tag)) },
	}));
}
