import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/main.tsx'
            ],
            refresh: true,
        }),
        react(),
        tailwindcss(),
        legacy({
            targets: ['defaults', 'not IE 11'],
        }),
    ],

    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
            '@util': path.resolve(__dirname, 'resources/util'),
            //  '@api': path.resolve(__dirname, 'resources/js/util/api'),
        },
        
    },



    assetsInclude: ['**/*.svg', '**/*.csv'],

    server: {
        host: '127.0.0.1',
       
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
})





