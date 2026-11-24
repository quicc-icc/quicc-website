import type { APIRoute } from "astro";
import { generateOgImage } from "../utils/generateOgImage";
import { getOgRoutes } from "../utils/ogRoutes";

export async function getStaticPaths() {
    const routes = await getOgRoutes();
    return routes.map(({ route, title, subtitle }) => ({
        params: { route },
        props: { title, subtitle },
    }));
}

export const GET: APIRoute = async ({ props }) => {
    const safeTitle = (props.title as string).replace(/&/g, 'and');
    return new Response(await generateOgImage(safeTitle, props.subtitle as string), {
        headers: { "Content-Type": "image/png" },
    });
};
