<!--
  Dropdown a11y 测试夹具：在 LocaleProvider 内渲染重写后的 Dropdown。
  触发器是默认 children（<button>Actions</button>，浮层内容用 render snippet：3 个
  Dropdown.Item，末项 disabled 以测 aria-disabled。visible + trigger='custom' 受控强制
  打开，便于 jsdom 断言静态 ARIA。直接包 LocaleProvider 渲染、不经 LocaleHarness
  （harness 注入的 children 在新 API 下会占用触发器插槽）。
  仅供 Dropdown.a11y.test.ts 使用，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Dropdown } from './index.js';

  interface Props {
    visible?: boolean;
    trigger?: 'hover' | 'focus' | 'click' | 'custom' | 'contextMenu';
    locale?: string;
  }

  // visible 默认 false（收起态）；exactOptionalPropertyTypes 下 Dropdown 的 visible:boolean
  // 不接受显式 undefined，故此处保底为 boolean 再透传。
  let { visible = false, trigger = 'click', locale = 'en_US' }: Props = $props();
</script>

<LocaleProvider {locale}>
  <Dropdown {visible} {trigger}>
    <button type="button">Actions</button>
    {#snippet render()}
      <Dropdown.Menu>
        <Dropdown.Item key="edit">Edit</Dropdown.Item>
        <Dropdown.Item key="dup">Duplicate</Dropdown.Item>
        <Dropdown.Item key="del" disabled>Delete</Dropdown.Item>
      </Dropdown.Menu>
    {/snippet}
  </Dropdown>
</LocaleProvider>
