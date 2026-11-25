import { SITE_TITLE } from '../consts';
import { getPosts } from '../i18n/content';
import { LANGS, t, type Lang } from '../i18n/ui';

// Imágenes OG que se generan en el build (ver src/pages/[...route].png.ts).
// BaseHead usa esta misma lista: una página sin imagen propia usa /og.png.
export interface OgRoute {
    route: string;
    title: string;
    subtitle: string;
}

async function routesFor(lang: Lang): Promise<OgRoute[]> {
    const prefix = lang === 'en' ? '' : `${lang}/`;
    const posts = await getPosts(lang);
    return [
        { route: lang === 'en' ? 'og' : lang, title: SITE_TITLE, subtitle: 'ICC · UBA-CONICET' },
        { route: `${prefix}projects`, title: t(lang, 'projects.metaTitle'), subtitle: SITE_TITLE },
        { route: `${prefix}publications`, title: t(lang, 'pubs.title'), subtitle: SITE_TITLE },
        { route: `${prefix}team`, title: t(lang, 'team.title'), subtitle: SITE_TITLE },
        { route: `${prefix}blog`, title: t(lang, 'blog.title'), subtitle: SITE_TITLE },
        { route: `${prefix}archive`, title: t(lang, 'archive.title'), subtitle: SITE_TITLE },
        { route: `${prefix}tags`, title: t(lang, 'tags.title'), subtitle: SITE_TITLE },
        ...posts.map((post) => ({
            route: `${prefix}blog/${post.id}`,
            title: post.data.title,
            subtitle: t(lang, 'post.subtitle'),
        })),
    ];
}

export async function getOgRoutes(): Promise<OgRoute[]> {
    return (await Promise.all(LANGS.map(routesFor))).flat();
}
