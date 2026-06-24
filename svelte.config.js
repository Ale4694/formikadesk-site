import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Sito completamente statico: pronto per Cloudflare Pages, Netlify o GitHub Pages.
		adapter: adapter()
	}
};

export default config;
