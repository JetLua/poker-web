import {defineConfig} from 'vite'
import {resolve} from 'node:path'
import {sveltekit} from '@sveltejs/kit/vite'

export default defineConfig({
	plugins: [
		sveltekit()
	],
	css: {
		preprocessorOptions: {
			scss: {api: 'modern'}
		}
	},
	resolve: {
		preserveSymlinks: false,
		alias: {
			'@': resolve('.'),
			'~': resolve('src')
		}
	},
	server: {
		fs: {
			allow: [
				process.cwd()
			]
		}
	}
})
