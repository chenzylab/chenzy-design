import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import UnoCSS from 'unocss/vite';
import { presetUno } from 'unocss';
import presetIcons from '@unocss/preset-icons';
import { presetChenzy } from '@chenzy-design/unocss-preset';

export default defineConfig({
  plugins: [
    sveltekit(),
    UnoCSS({
      configFile: false,
      presets: [
        presetUno(),
        presetChenzy(),
        // 纯 class 图标路径：<span class="i-lucide-*" />。
        // 图标数据来自本地 @iconify-json/* 包（离线、可 prerender），
        // 追加其它图标集只需装对应 @iconify-json/<collection> 并用 i-<collection>-* 前缀。
        presetIcons({
          scale: 1.2,
          extraProperties: {
            display: 'inline-block',
            'vertical-align': 'middle',
          },
        }),
      ],
    }),
  ],
});
