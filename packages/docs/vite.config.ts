import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import UnoCSS from 'unocss/vite';
import { presetUno } from 'unocss';
import presetIcons from '@unocss/preset-icons';
import presetTypography from '@unocss/preset-typography';
import { presetChenzy } from '@chenzy-design/unocss-preset';

export default defineConfig({
  plugins: [
    sveltekit(),
    UnoCSS({
      configFile: false,
      presets: [
        presetUno(),
        presetChenzy(),
        // 正文排版：组件文档正文容器加 `prose` 类，typography 只作用于容器内后代，
        // demo 预览区加 `not-prose` 排除（作用域收敛，正文样式够不到 demo 组件）。
        // 采用 preset 默认排版；cssExtend 仅去掉一个明显缺陷：行内 code 的反引号包裹
        //（Tailwind Typography 血统给 code::before/::after 注入 `，观感差且非本站需要）。
        presetTypography({
          cssExtend: {
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          },
        }),
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
