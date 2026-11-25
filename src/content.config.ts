import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

type SchemaContext = { image: () => any };

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }: SchemaContext) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			authors: z.array(z.string()).optional(), // References 'id' in authors.json
			toc: z.boolean().optional(),
			tags: z.array(z.string()).optional(),
		}),
});

// Traducciones al español (opcionales): src/content/blog-es/<mismo nombre>.mdx.
// Sólo llevan título, descripción y texto; la fecha, la imagen y las etiquetas
// se toman de la noticia original.
const blogEs = defineCollection({
	loader: glob({ base: './src/content/blog-es', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		updatedDate: z.coerce.date().optional(),
	}),
});

export const collections = { blog, blogEs };
