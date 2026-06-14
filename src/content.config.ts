import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

// Define a collection of lessons
const lessons = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/lessons', pattern: '**/*.{md,mdx}' }),

	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		lessonId: z.string().optional(),
		totalQuestions: z.number().optional(),
		author: z.string().optional(),
		draft: z.boolean().optional(),
	}),
});

// Export collections
export const collections = { lessons };
