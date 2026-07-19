<script lang="ts">
  // 对齐 Semi「自定义渲染规则」：options.customRenderRule 在只读模式下匹配 key/value，
  // 命中的 token 用自定义 DOM 渲染（这里把十六进制颜色值渲染成色块 + 文本）。
  import { JsonViewer } from '@chenzy-design/svelte';

  const value = JSON.stringify(
    { primary: '#0064fa', success: '#3bb346', danger: '#f93920', name: 'theme' },
    null,
    2,
  );

  const customRenderRule = [
    {
      // 匹配十六进制颜色字符串值。
      match: (v: string) => /^"#[0-9a-fA-F]{6}"$/.test(v),
      render: (v: string) => {
        const color = v.replace(/"/g, '');
        const wrap = document.createElement('span');
        wrap.style.display = 'inline-flex';
        wrap.style.alignItems = 'center';
        wrap.style.gap = '4px';
        const swatch = document.createElement('span');
        swatch.style.width = '10px';
        swatch.style.height = '10px';
        swatch.style.borderRadius = '2px';
        swatch.style.background = color;
        swatch.style.display = 'inline-block';
        const text = document.createElement('span');
        text.textContent = v;
        wrap.append(swatch, text);
        return wrap;
      },
    },
  ];
</script>

<JsonViewer {value} height={220} width="100%" options={{ readOnly: true, customRenderRule }} />
