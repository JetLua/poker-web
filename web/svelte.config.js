import {resolve} from 'node:path'
import adapter from '@sveltejs/adapter-static'
import {sveltePreprocess} from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: sveltePreprocess({
    typescript: true,
    postcss: true,
    scss: {
      importer: [
        alias
      ],
      // prependData: '@use "sass:list"; @import "./src/env.scss";'
    }
  }),

	kit: {
    paths: {
      // base: 'https://static.yake.app/astro'
    },
		adapter: adapter(),
		alias: {
      '~/*': 'src/*',
      '@/*': './*'
    },
	}
}


const srcPath = resolve('src')

/**
 * @param {string} url
 */
function alias(url) {
  if (url.startsWith('~')) return {file: url.replace('~', srcPath)}
  return url
}

export default config
