<!--
  仅供 Collapse.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  DOM 对齐 Semi：每个 Header 为 role=button tabindex=0（无 roving，全部可 Tab）。
  前后各放按钮验证 Tab 依序经过各 Header，Enter/Space 展开当前 Header。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Collapse } from './index.js';
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <Collapse>
    <Collapse.Panel header="Panel One" itemKey="p1">
      <p>content p1</p>
    </Collapse.Panel>
    <Collapse.Panel header="Panel Two" itemKey="p2">
      <p>content p2</p>
    </Collapse.Panel>
    <Collapse.Panel header="Panel Three" itemKey="p3">
      <p>content p3</p>
    </Collapse.Panel>
  </Collapse>
  <button type="button" data-testid="after">after</button>
</LocaleProvider>
