import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import UnoCSS from 'unocss/vite';
import { presetUno } from 'unocss';
import { presetChenzy } from '@chenzy-design/unocss-preset';

export default defineConfig({
  plugins: [
    // configFile: false → use inline presets, don't auto-discover root uno.config.ts
    UnoCSS({ configFile: false, presets: [presetUno(), presetChenzy()] }),
    svelte(),
  ],
});
