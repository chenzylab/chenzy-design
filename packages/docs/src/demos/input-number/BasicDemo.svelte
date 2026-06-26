<script lang="ts">
  import { InputNumber, Text } from '@chenzy-design/svelte';

  let numVal = $state<number | null>(3);
  let amountVal = $state<number | null>(12000);
  let wheelVal = $state<number | null>(50);
  let strictVal = $state<number | null>(5);
  let sidesVal = $state<number | null>(2);
  let strictHit = $state('');
</script>

<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px;">
  <div style="display: flex; align-items: center; gap: 8px;">
    <InputNumber value={numVal} min={0} max={10} onChange={(v) => (numVal = v)} />
    <Text type="tertiary">数值：{numVal}</Text>
  </div>

  <div data-testid="inputnumber-fmt">
    <InputNumber
      value={amountVal}
      min={0}
      step={1000}
      formatter={(n) => `¥ ${n.toLocaleString('en-US')}`}
      parser={(s) => Number(s.replace(/[^\d.-]/g, ''))}
      onChange={(v) => (amountVal = v)}
    />
    <Text type="tertiary">金额：{amountVal}（长按 +/- 连续增减）</Text>
  </div>

  <div data-testid="inputnumber-wheel">
    <InputNumber
      value={wheelVal}
      min={0}
      max={100}
      mouseWheel
      selectOnFocus
      onChange={(v) => (wheelVal = v)}
    />
    <Text type="tertiary">滚轮调值（聚焦后滚动）+ 聚焦全选：{wheelVal}</Text>
  </div>

  <div data-testid="inputnumber-strict">
    <InputNumber
      value={strictVal}
      min={0}
      max={10}
      boundaryMode="strict"
      onChange={(v) => (strictVal = v)}
      onBoundaryHit={(e) => (strictHit = `${e.boundary} @ ${e.value}`)}
    />
    <Text type="tertiary">strict 越界拒绝回滚；boundaryHit：{strictHit || '—'}</Text>
  </div>

  <div data-testid="inputnumber-sides">
    <div style="width: 160px">
      <InputNumber
        value={sidesVal}
        min={0}
        max={9}
        controlsPosition="sides"
        onChange={(v) => (sidesVal = v)}
      />
    </div>
    <Text type="tertiary">controlsPosition=sides 两侧按钮：{sidesVal}</Text>
  </div>

  <div data-testid="inputnumber-inner">
    <div style="width: 160px">
      <InputNumber defaultValue={1} min={0} innerButtons />
    </div>
    <Text type="tertiary">innerButtons 内嵌按钮（hover/聚焦显形）</Text>
  </div>

  <div data-testid="inputnumber-affix">
    <div style="width: 200px">
      <InputNumber defaultValue={100} min={0} step={10} prefix="¥" suffix="元" />
    </div>
    <Text type="tertiary">prefix/suffix 前后缀（string）</Text>
  </div>

  <div data-testid="inputnumber-affix-snippet">
    <div style="width: 200px">
      <InputNumber defaultValue={50} min={0} max={100}>
        {#snippet suffix()}
          <span style="color: var(--cd-color-primary)">%</span>
        {/snippet}
      </InputNumber>
    </div>
    <Text type="tertiary">suffix 用 Snippet 自定义渲染</Text>
  </div>

  <div data-testid="inputnumber-locale">
    <InputNumber defaultValue={1234567} locale="de-DE" />
    <Text type="tertiary">locale=de-DE 千分位（无 formatter 时走 Intl）</Text>
  </div>

  <div data-testid="inputnumber-label">
    <label for="qty-demo"><Text type="tertiary">数量（id 关联 label）</Text></label>
    <InputNumber id="qty-demo" defaultValue={1} min={0} autofocus={false} />
  </div>
</div>
