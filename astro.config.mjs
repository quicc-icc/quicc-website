// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import i18nReport from './scripts/i18n-report.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://quicc.dc.uba.ar',
	base: '/',
	integrations: [
		mdx(),
		// El sitemap indica, para cada página, su versión en el otro idioma
		sitemap({
			i18n: {
				defaultLocale: 'en',
				locales: { en: 'en', es: 'es' },
			},
		}),
		i18nReport(),
	],
	markdown: {
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'github-dark',
			},
		},
		// Fórmulas con $...$ y $$...$$ en las noticias (KaTeX)
		processor: unified({
			remarkPlugins: [remarkMath],
			rehypePlugins: [rehypeKatex],
		}),
	},
	build: {
		inlineStylesheets: 'always',
	},
});
