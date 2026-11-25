import type { ImageMetadata } from 'astro';

// Every photo in src/assets/team/ is picked up automatically, keyed by file name
// (e.g. 'bosyk.png'). To add a photo, drop the file in that folder and set the
// same name in the member's "avatar" field in authors.json.
const files = import.meta.glob<ImageMetadata>('../assets/team/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
});

export const teamImages: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(files).map(([path, image]) => [path.split('/').pop()!, image]),
);
