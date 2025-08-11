import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';
import { title } from './package.json';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: title,
    permissions: ['tabs', 'storage', 'downloads'],
  },
  srcDir: 'src',
  outDir: 'dist',
  hooks: {
    'build:manifestGenerated': (wxt, manifest) => {
      if (wxt.config.mode === 'development') manifest.name += ' (Dev)';
    },
  },
  imports: false,
  vite: () => ({
    plugins: [preact(), tailwindcss()],
  }),
});
