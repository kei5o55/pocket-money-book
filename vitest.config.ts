import { defineVitestConfig } from '@nuxt/test-utils/config'
import { fileURLToPath } from 'node:url'

export default defineVitestConfig({
    resolve: {
        alias: {
        // Nuxt 4 の app/ ディレクトリ構成に合わせて ~ を app/ にマッピング
        '~': fileURLToPath(new URL('./app', import.meta.url)),
        '@': fileURLToPath(new URL('./app', import.meta.url)),
        },
    },
    test: {
        environment: 'nuxt',
    },
})