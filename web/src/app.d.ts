/// <reference types="vite/client" />

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	namespace astro {
		interface Profile {
			_id: string
			birthday: number
			gender: 0 | 1
		}

		type Stem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸'
		type Branch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥'
		type Spirit = '比肩' | '劫财' | '食神' | '伤官' | '偏财' | '正财' | '七杀' | '正官' | '偏印' | '正印'
		type Fe = '金' | '木' | '水' | '火' | '土'
	}

	interface ImportMetaEnv {
		readonly VITE_BASE_URL: string
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv
	}
}

export {}
