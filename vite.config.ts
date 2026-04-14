/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'icons/*.svg'],
            manifest: {
                name: 'Ealing Exchange - Currency Exchange',
                short_name: 'Ealing Exchange',
                description: 'Live currency exchange rates in West Ealing & Hanwell. Buy and sell foreign currency online.',
                theme_color: '#0A2540',
                background_color: '#f8fafc',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                orientation: 'portrait-primary',
                icons: [
                    {
                        src: '/icons/pwa-192x192.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                        purpose: 'any',
                    },
                    {
                        src: '/icons/pwa-512x512.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'any',
                    },
                    {
                        src: '/icons/pwa-512x512.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'maskable',
                    },
                ],
                screenshots: [
                    {
                        src: 'https://ealingexchange.co.uk/',
                        sizes: '1280x800',
                        type: 'image/png',
                        form_factor: 'wide',
                        label: 'Ealing Exchange Homepage',
                    },
                ],
                categories: ['finance', 'shopping'],
                shortcuts: [
                    {
                        name: 'Live Rates',
                        short_name: 'Rates',
                        description: 'View live currency exchange rates',
                        url: '/',
                        icons: [{ src: '/icons/pwa-192x192.svg', sizes: '192x192' }],
                    },
                    {
                        name: 'Contact Us',
                        short_name: 'Contact',
                        description: 'Find our store locations',
                        url: '/contact',
                        icons: [{ src: '/icons/pwa-192x192.svg', sizes: '192x192' }],
                    },
                ],
            },
            workbox: {
                // Cache the key app shell assets
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                // Runtime caching for API calls
                runtimeCaching: [
                    {
                        // Cache Google Fonts
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        // Cache OpenStreetMap tiles for the store locator
                        urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'openstreetmap-tile-cache',
                            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        // Network-first strategy for Firestore data (live rates)
                        urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'firestore-data-cache',
                            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: false, // Keep dev clean, only enable PWA in production build
            },
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
                    vendor: ['react', 'react-dom', 'react-helmet-async', 'framer-motion'],
                },
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
});
