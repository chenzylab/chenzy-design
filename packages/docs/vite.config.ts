import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import UnoCSS from 'unocss/vite';
import { presetUno } from 'unocss';
import { presetChenzy } from '@chenzy-design/unocss-preset';

export default defineConfig({
  plugins: [
    sveltekit(),
    UnoCSS({ configFile: false, presets: [presetUno(), presetChenzy()] }),
  ],
});
