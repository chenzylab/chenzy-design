<script lang="ts">
  import {
    Button,
    Divider,
    Space,
    Title,
    Text,
    Paragraph,
    Link,
  } from '@chenzy-design/svelte';

  // ---- theme ----
  let theme = $state<'light' | 'dark'>('light');

  $effect(() => {
    document.documentElement.dataset.theme = theme;
  });

  // ---- scene selection ----
  type Scene = 'button' | 'typography' | 'layout';
  let scene = $state<Scene>('button');

  const scenes: { id: Scene; label: string }[] = [
    { id: 'button', label: 'Button' },
    { id: 'typography', label: 'Typography' },
    { id: 'layout', label: 'Layout' },
  ];

  // ---- scene 1: Button ----
  let btnType = $state<'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger'>('secondary');
  let btnSize = $state<'small' | 'default' | 'large'>('default');
  let btnBlock = $state(false);
  let btnDisabled = $state(false);
  let btnLoading = $state(false);
  let btnText = $state('按钮');

  // ---- scene 2: Typography ----
  let typoComp = $state<'Title' | 'Text' | 'Paragraph' | 'Link'>('Title');
  let typoType = $state<'default' | 'secondary' | 'tertiary' | 'warning' | 'danger' | 'success'>(
    'default',
  );
  let typoStrong = $state(false);
  let typoUnderline = $state(false);
  let typoDelete = $state(false);
  let typoMark = $state(false);
  let typoCode = $state(false);
  let typoHeading = $state<1 | 2 | 3 | 4 | 5 | 6>(1);
  let typoText = $state('设计即沟通');

  // ---- scene 3: Layout ----
  let layoutDirection = $state<'horizontal' | 'vertical'>('horizontal');
  let layoutSpacing = $state<'tight' | 'medium' | 'loose'>('medium');
  let layoutAlign = $state<'start' | 'center' | 'end'>('center');
  let layoutWrap = $state(false);
  let layoutDashed = $state(false);

  // ---- code-string helper ----
  type PropValue = string | number | boolean | undefined;

  /**
   * Build a JSX-style tag string, omitting props equal to their default.
   * Booleans render as bare attribute names; strings/numbers as key="value".
   */
  function buildCode(
    tag: string,
    props: { key: string; value: PropValue; def: PropValue }[],
    children: string,
  ): string {
    const attrs = props
      .filter((p) => p.value !== p.def && p.value !== undefined)
      .map((p) => {
        if (typeof p.value === 'boolean') return p.value ? p.key : '';
        return `${p.key}="${p.value}"`;
      })
      .filter(Boolean);

    const head = attrs.length ? `<${tag} ${attrs.join(' ')}>` : `<${tag}>`;
    return `${head}${children}</${tag}>`;
  }

  const buttonCode = $derived(
    buildCode(
      'Button',
      [
        { key: 'type', value: btnType, def: 'secondary' },
        { key: 'size', value: btnSize, def: 'default' },
        { key: 'block', value: btnBlock, def: false },
        { key: 'disabled', value: btnDisabled, def: false },
        { key: 'loading', value: btnLoading, def: false },
      ],
      btnText,
    ),
  );

  const typographyCode = $derived(
    buildCode(
      typoComp,
      [
        { key: 'heading', value: typoComp === 'Title' ? typoHeading : undefined, def: 1 },
        { key: 'href', value: typoComp === 'Link' ? '#' : undefined, def: undefined },
        { key: 'type', value: typoType, def: 'default' },
        { key: 'strong', value: typoStrong, def: false },
        { key: 'underline', value: typoUnderline, def: false },
        { key: 'delete', value: typoDelete, def: false },
        { key: 'mark', value: typoMark, def: false },
        { key: 'code', value: typoCode, def: false },
      ],
      typoText,
    ),
  );

  const layoutCode = $derived(
    `${buildCode(
      'Space',
      [
        { key: 'direction', value: layoutDirection, def: 'horizontal' },
        { key: 'spacing', value: layoutSpacing, def: 'medium' },
        { key: 'align', value: layoutAlign, def: 'center' },
        { key: 'wrap', value: layoutWrap, def: false },
      ],
      '\n  <Button>一</Button>\n  <Button>二</Button>\n  <Button>三</Button>\n',
    )}\n${buildCode(
      'Divider',
      [{ key: 'dashed', value: layoutDashed, def: false }],
      '示例',
    )}`,
  );

  const code = $derived(
    scene === 'button' ? buttonCode : scene === 'typography' ? typographyCode : layoutCode,
  );
</script>

<div class="page">
  <header class="topbar">
    <strong class="brand">chenzy-design · playground</strong>
    <Button type="tertiary" size="small" onclick={() => (theme = theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </Button>
  </header>

  <div class="body">
    <aside class="panel">
      <div class="field">
        <span class="label">场景</span>
        <div class="tabs">
          {#each scenes as s (s.id)}
            <Button type={scene === s.id ? 'primary' : 'tertiary'} size="small" onclick={() => (scene = s.id)}>
              {s.label}
            </Button>
          {/each}
        </div>
      </div>

      <Divider />

      {#if scene === 'button'}
        <label class="field">
          <span class="label">type</span>
          <select bind:value={btnType}>
            <option value="primary">primary</option>
            <option value="secondary">secondary</option>
            <option value="tertiary">tertiary</option>
            <option value="warning">warning</option>
            <option value="danger">danger</option>
          </select>
        </label>
        <label class="field">
          <span class="label">size</span>
          <select bind:value={btnSize}>
            <option value="small">small</option>
            <option value="default">default</option>
            <option value="large">large</option>
          </select>
        </label>
        <label class="field row">
          <input type="checkbox" bind:checked={btnBlock} />
          <span class="label">block</span>
        </label>
        <label class="field row">
          <input type="checkbox" bind:checked={btnDisabled} />
          <span class="label">disabled</span>
        </label>
        <label class="field row">
          <input type="checkbox" bind:checked={btnLoading} />
          <span class="label">loading</span>
        </label>
        <label class="field">
          <span class="label">文本内容</span>
          <input type="text" bind:value={btnText} />
        </label>
      {:else if scene === 'typography'}
        <label class="field">
          <span class="label">组件</span>
          <select bind:value={typoComp}>
            <option value="Title">Title</option>
            <option value="Text">Text</option>
            <option value="Paragraph">Paragraph</option>
            <option value="Link">Link</option>
          </select>
        </label>
        {#if typoComp === 'Title'}
          <label class="field">
            <span class="label">heading</span>
            <select bind:value={typoHeading}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
            </select>
          </label>
        {/if}
        <label class="field">
          <span class="label">type</span>
          <select bind:value={typoType}>
            <option value="default">default</option>
            <option value="secondary">secondary</option>
            <option value="tertiary">tertiary</option>
            <option value="warning">warning</option>
            <option value="danger">danger</option>
            <option value="success">success</option>
          </select>
        </label>
        <label class="field row">
          <input type="checkbox" bind:checked={typoStrong} />
          <span class="label">strong</span>
        </label>
        <label class="field row">
          <input type="checkbox" bind:checked={typoUnderline} />
          <span class="label">underline</span>
        </label>
        <label class="field row">
          <input type="checkbox" bind:checked={typoDelete} />
          <span class="label">delete</span>
        </label>
        <label class="field row">
          <input type="checkbox" bind:checked={typoMark} />
          <span class="label">mark</span>
        </label>
        <label class="field row">
          <input type="checkbox" bind:checked={typoCode} />
          <span class="label">code</span>
        </label>
        <label class="field">
          <span class="label">文本</span>
          <input type="text" bind:value={typoText} />
        </label>
      {:else}
        <label class="field">
          <span class="label">direction</span>
          <select bind:value={layoutDirection}>
            <option value="horizontal">horizontal</option>
            <option value="vertical">vertical</option>
          </select>
        </label>
        <label class="field">
          <span class="label">spacing</span>
          <select bind:value={layoutSpacing}>
            <option value="tight">tight</option>
            <option value="medium">medium</option>
            <option value="loose">loose</option>
          </select>
        </label>
        <label class="field">
          <span class="label">align</span>
          <select bind:value={layoutAlign}>
            <option value="start">start</option>
            <option value="center">center</option>
            <option value="end">end</option>
          </select>
        </label>
        <label class="field row">
          <input type="checkbox" bind:checked={layoutWrap} />
          <span class="label">wrap</span>
        </label>
        <label class="field row">
          <input type="checkbox" bind:checked={layoutDashed} />
          <span class="label">dashed (divider)</span>
        </label>
      {/if}
    </aside>

    <main class="preview-area">
      <section class="preview">
        {#if scene === 'button'}
          <Button
            type={btnType}
            size={btnSize}
            block={btnBlock}
            disabled={btnDisabled}
            loading={btnLoading}
          >
            {btnText}
          </Button>
        {:else if scene === 'typography'}
          {#if typoComp === 'Title'}
            <Title
              heading={typoHeading}
              type={typoType}
              strong={typoStrong}
              underline={typoUnderline}
              delete={typoDelete}
              mark={typoMark}
              code={typoCode}
            >
              {typoText}
            </Title>
          {:else if typoComp === 'Text'}
            <Text
              type={typoType}
              strong={typoStrong}
              underline={typoUnderline}
              delete={typoDelete}
              mark={typoMark}
              code={typoCode}
            >
              {typoText}
            </Text>
          {:else if typoComp === 'Paragraph'}
            <Paragraph
              type={typoType}
              strong={typoStrong}
              underline={typoUnderline}
              delete={typoDelete}
              mark={typoMark}
              code={typoCode}
            >
              {typoText}
            </Paragraph>
          {:else}
            <Link
              href="#"
              type={typoType}
              strong={typoStrong}
              underline={typoUnderline}
              delete={typoDelete}
              mark={typoMark}
              code={typoCode}
            >
              {typoText}
            </Link>
          {/if}
        {:else}
          <Space
            direction={layoutDirection}
            spacing={layoutSpacing}
            align={layoutAlign}
            wrap={layoutWrap}
          >
            <Button type="primary">一</Button>
            <Button>二</Button>
            <Button type="tertiary">三</Button>
          </Space>
          <Divider dashed={layoutDashed}>示例</Divider>
        {/if}
      </section>

      <section class="code-block">
        <span class="label">生成代码</span>
        <pre class="code">{code}</pre>
      </section>
    </main>
  </div>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--cd-color-bg-0);
    color: var(--cd-color-text-0);
    font-family: var(--cd-font-family, system-ui, sans-serif);
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--cd-spacing-4, 16px) var(--cd-spacing-6, 24px);
    border-bottom: 1px solid var(--cd-color-border);
    background: var(--cd-color-bg-1);
  }

  .brand {
    font-size: var(--cd-font-size-4, 18px);
    font-weight: var(--cd-font-weight-semibold, 600);
  }

  .body {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-3, 12px);
    width: 320px;
    flex-shrink: 0;
    padding: var(--cd-spacing-5, 20px);
    border-right: 1px solid var(--cd-color-border);
    background: var(--cd-color-bg-1);
    overflow-y: auto;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-2, 8px);
  }

  .field.row {
    flex-direction: row;
    align-items: center;
    gap: var(--cd-spacing-2, 8px);
  }

  .label {
    font-size: var(--cd-font-size-1, 12px);
    color: var(--cd-color-text-1);
  }

  .tabs {
    display: flex;
    gap: var(--cd-spacing-2, 8px);
  }

  select,
  input[type='text'] {
    width: 100%;
    padding: var(--cd-spacing-2, 8px);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-radius-2, 6px);
    background: var(--cd-color-bg-0);
    color: var(--cd-color-text-0);
    font-size: var(--cd-font-size-2, 14px);
  }

  .preview-area {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-5, 20px);
    flex: 1;
    padding: var(--cd-spacing-6, 24px);
    min-width: 0;
  }

  .preview {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-4, 16px);
    align-items: flex-start;
    padding: var(--cd-spacing-6, 24px);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-radius-3, 8px);
    background: var(--cd-color-bg-1);
    min-height: 120px;
  }

  .code-block {
    display: flex;
    flex-direction: column;
    gap: var(--cd-spacing-2, 8px);
  }

  .code {
    margin: 0;
    padding: var(--cd-spacing-4, 16px);
    border: 1px solid var(--cd-color-border);
    border-radius: var(--cd-radius-3, 8px);
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-0);
    font-family: var(--cd-font-family-mono, ui-monospace, monospace);
    font-size: var(--cd-font-size-2, 14px);
    line-height: 1.6;
    overflow-x: auto;
    white-space: pre;
  }
</style>
