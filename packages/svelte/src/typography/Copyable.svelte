<!--
  Copyable — Typography 复制按钮（严格对齐 Semi typography/copyable.tsx）。
  职责：复制按钮渲染 + 复制成功态 + live announce。默认复制图标外层包 Tooltip
  显示 copyTip 文案（对齐 Semi <Tooltip content={copyTip}><a .../></Tooltip>），
  copied 成功态与 render 自定义渲染分支不套 Tooltip（对齐 Semi 只在默认图标路径套）。
-->
<script lang="ts">
  import { createCopyable } from '@chenzy-design/core';
  import { IconCopy, IconTick } from '@chenzy-design/icons';
  import { useLocale } from '../locale-provider/index.js';
  import Tooltip from '../tooltip/Tooltip.svelte';
  import type { CopyableConfig } from './types.js';

  interface Props {
    config: CopyableConfig;
    /** 兜底复制内容获取函数（config.content 缺省时取宿主 textContent）。 */
    getDefaultContent: () => string;
  }
  let { config, getDefaultContent }: Props = $props();

  const loc = useLocale();

  let copied = $state(false);
  const copyApi = createCopyable({
    onChange: (c) => (copied = c),
    onCopy: () => announce(config.successTip ?? loc().t('Typography.copied')),
  });
  $effect(() => () => copyApi.destroy());

  // 复制：core copy() 返回 Promise<boolean>（永不 throw），据其结果回调 onCopy(e, content, res)。
  async function doCopy(e: MouseEvent): Promise<void> {
    const content = config.content ?? getDefaultContent();
    const res = await copyApi.copy(content);
    config.onCopy?.(e, content, res);
  }

  // --- single live region for copy announce（命令式, cleanup）---
  let liveEl: HTMLDivElement | undefined;
  function ensureLive(): HTMLDivElement | null {
    if (typeof document === 'undefined') return null;
    if (!liveEl) {
      liveEl = document.createElement('div');
      liveEl.setAttribute('aria-live', 'polite');
      liveEl.setAttribute('role', 'status');
      const s = liveEl.style;
      s.position = 'absolute';
      s.width = '1px';
      s.height = '1px';
      s.margin = '-1px';
      s.padding = '0';
      s.overflow = 'hidden';
      s.clipPath = 'inset(50%)';
      s.whiteSpace = 'nowrap';
      document.body.appendChild(liveEl);
    }
    return liveEl;
  }
  function announce(msg: string): void {
    const el = ensureLive();
    if (!el || !msg) return;
    el.textContent = '';
    el.textContent = msg;
  }
  $effect(() => () => {
    liveEl?.remove();
    liveEl = undefined;
  });

  const copyLabel = $derived(config.copyTip ?? loc().t('Typography.copy'));
</script>

{#snippet copyIconDefault()}
  <IconCopy size="inherit" aria-hidden="true" />
{/snippet}
{#snippet copiedIconDefault()}
  <IconTick size="inherit" aria-hidden="true" />
{/snippet}

{#if config.render}
  {@render config.render(copied, doCopy, config)}
{:else if copied}
  <span class="cd-typography-action-copied">
    {#if config.successTip}{config.successTip}{:else}{@render copiedIconDefault()}{loc().t('Typography.copied')}{/if}
  </span>
{:else}
  <span class="cd-typography-action-copy">
    <Tooltip content={copyLabel} position="top">
      <button
        type="button"
        class="cd-typography-action-copy-icon"
        aria-label={copyLabel}
        onclick={doCopy}
      >
        {#if config.icon}{@render config.icon()}{:else}{@render copyIconDefault()}{/if}
      </button>
    </Tooltip>
  </span>
{/if}
