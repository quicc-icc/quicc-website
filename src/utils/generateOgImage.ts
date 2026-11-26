import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Fuentes y logo locales (los mismos del sitio): el build no depende de servicios externos.
const PUBLIC_DIR = join(process.cwd(), 'public');
let assetCache: Promise<[Buffer, Buffer, string]> | undefined;

function loadAssets() {
    assetCache ??= Promise.all([
        readFile(join(PUBLIC_DIR, 'fonts', 'atkinson-regular.woff')),
        readFile(join(PUBLIC_DIR, 'fonts', 'atkinson-bold.woff')),
        readFile(join(PUBLIC_DIR, 'quicc_darkk.png')).then(
            (logo) => `data:image/png;base64,${logo.toString('base64')}`
        ),
    ]);
    return assetCache;
}

const WIDTH = 1200;
const HEIGHT = 630;

// Tamaño de letra del título según su largo, para que entre completo en el espacio
// disponible (264 px de alto: 3 líneas a 80/64 px, 4 a 54 px, 5 a 44 px).
function titleFontSize(title: string) {
    const length = title.length;
    if (length <= 45) return 80;
    if (length <= 70) return 64;
    if (length <= 115) return 54;
    return 44;
}

export async function generateOgImage(title: string, subtitle: string) {
    const [fontDataRegular, fontDataBold, logoSrc] = await loadAssets();

    // El contenido va en una caja posicionada con top/right/bottom/left (no con
    // width/height 100% + padding), así no se sale del lienzo según cómo cada
    // versión de satori calcule el box model.
    const markup = html`
        <div style="display: flex; position: relative; width: ${WIDTH}px; height: ${HEIGHT}px; background-color: #0f172a; font-family: 'Atkinson'; overflow: hidden;">

            <div style="display: flex; position: absolute; top: -150px; right: -50px; width: 600px; height: 600px; background-image: linear-gradient(135deg, rgba(56, 189, 248, 0.4), rgba(49, 46, 129, 0)); border-radius: 50%;"></div>
            <div style="display: flex; position: absolute; bottom: -150px; left: -50px; width: 600px; height: 600px; background-image: linear-gradient(45deg, rgba(167, 139, 250, 0.4), rgba(88, 28, 135, 0)); border-radius: 50%;"></div>

            <div style="display: flex; flex-direction: column; justify-content: space-between; position: absolute; top: 64px; right: 80px; bottom: 64px; left: 80px;">
                <div style="display: flex;">
                    <div style="display: flex; align-items: center; padding: 12px 24px; background-color: rgba(255, 255, 255, 0.1); border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.2);">
                        <span style="color: #ffffff; font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                            ${subtitle}
                        </span>
                    </div>
                </div>

                <div style="display: flex; color: #ffffff; font-size: ${titleFontSize(title)}px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; max-width: 900px; max-height: 264px; overflow: hidden;">
                    ${title}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <span style="color: #cbd5e1; font-size: 34px; font-weight: 700;">QuICC</span>
                        <span style="color: #94a3b8; font-size: 26px; font-weight: 400;">Quantum Information, Computation and Communication · ICC-UBA</span>
                    </div>
                    <img src="${logoSrc}" width="73" height="100" style="width: 73px; height: 100px;" />
                </div>
            </div>
        </div>
    `;

    const svg = await satori(markup, {
        width: WIDTH,
        height: HEIGHT,
        fonts: [
            { name: "Atkinson", data: fontDataRegular, weight: 400, style: "normal" },
            { name: "Atkinson", data: fontDataBold, weight: 700, style: "normal" }
        ],
    });

    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    return new Uint8Array(pngData.asPng());
}
