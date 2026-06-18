import { defineConfig, presetUno } from 'unocss';
import { presetChenzy } from '@chenzy-design/unocss-preset';

export default defineConfig({
  presets: [presetUno(), presetChenzy()],
});
