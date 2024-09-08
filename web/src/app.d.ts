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
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv
	}

	namespace yew {
		enum FileType {
			File = 1,
			Dir = 2
		}

		interface File {
			parent?: string
			id: string
			name: string
			size?: number
			type: FileType
			createdAt: number
			updatedAt: number
		}
	}
}



export {}
