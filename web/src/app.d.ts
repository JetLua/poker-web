/// <reference types="vite/client" />

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	interface ImportMetaEnv {
		readonly VITE_BASE_URL: string
		readonly VITE_WS: string
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv
	}

	namespace yew {
		interface Player {
			banker: boolean
		}
	}
}



export {}
