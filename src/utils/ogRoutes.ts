import { getCollection } from 'astro:content';
import { SITE_TITLE } from '../consts';

// Imágenes OG que se generan en el build (ver src/pages/[...route].png.ts).
// BaseHead usa esta misma lista: una página sin imagen propia usa /og.png.
export interface OgRoute {
    route: string;
    title: string;
    subtitle: string;
}

export async function getOgRoutes(): Promise<OgRoute[]> {
    const posts = await getCollection('blog');

    return [
        { route: 'og', title: SITE_TITLE, subtitle: 'ICC · UBA-CONICET' },
        { route: 'projects', title: 'Projects', subtitle: SITE_TITLE },
        { route: 'publications', title: 'Publications', subtitle: SITE_TITLE },
        { route: 'team', title: 'Team', subtitle: SITE_TITLE },
        { route: 'blog', title: 'Blog', subtitle: SITE_TITLE },
        { route: 'archive', title: 'Archive', subtitle: SITE_TITLE },
        { route: 'tags', title: 'Tags', subtitle: SITE_TITLE },
        ...posts.map((post) => ({
            route: `blog/${post.id}`,
            title: post.data.title,
            subtitle: 'Blog Post',
        })),
    ];
}
