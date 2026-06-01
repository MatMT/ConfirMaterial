// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import path from 'path';
import vercel from '@astrojs/vercel';

import icon from 'astro-icon';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: 'https://example.com',
    output: 'server',
    adapter: vercel(),
    integrations: [mdx(), sitemap(), tailwind(), icon(), react()],
    vite: {
        resolve: {
            alias: {
                '@/component/react': path.resolve('./src/components/react'),
                '@/store': path.resolve('./src/store'),
                '@/pages': path.resolve('./src/pages'),
            }
        }
    }
});