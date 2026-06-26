<script lang="ts">
  import { Tabs, TabPane, Button, Text } from '@chenzy-design/svelte';

  const tabList = [
    { tab: '账户', itemKey: 'a' },
    { tab: '安全', itemKey: 'b' },
    { tab: '通知', itemKey: 'c', disabled: true },
  ];

  let activeTab = $state<string | number>('a');

  // 溢出滚动 demo：很多标签 + 窄容器触发滚动箭头
  let overflowActive = $state<string | number>('o1');
  const overflowTabs = [
    { tab: '概览', itemKey: 'o1' },
    { tab: '用户管理', itemKey: 'o2' },
    { tab: '权限配置', itemKey: 'o3' },
    { tab: '数据统计', itemKey: 'o4' },
    { tab: '消息中心', itemKey: 'o5' },
    { tab: '系统日志', itemKey: 'o6' },
    { tab: '安全审计', itemKey: 'o7' },
    { tab: '高级设置', itemKey: 'o8' },
  ];

  // overflow=dropdown demo：窄容器把放不下的标签收进末尾「更多」下拉
  let dropdownTabActive = $state<string | number>('o1');

  // type=button demo：分段按钮组
  let buttonTabActive = $state<string | number>('a');

  // addable demo：「+」按钮回调里父组件追加 tab（受控数据）
  let addableActive = $state<string | number>('t1');
  let addableTabs = $state([
    { tab: '标签 1', itemKey: 't1' },
    { tab: '标签 2', itemKey: 't2' },
  ]);
  let addableSeq = 2;
  function addTab() {
    addableSeq += 1;
    const key = `t${addableSeq}`;
    addableTabs = [...addableTabs, { tab: `标签 ${addableSeq}`, itemKey: key }];
    addableActive = key;
  }

  // 纯声明式自动收集 demo：不传 tabList，仅写 <Tabs.Pane>，标签栏自动推导
  let declActive = $state<string | number>('d1');

  // renderTabBar demo：完全自绘标签栏
  let renderBarActive = $state<string | number>('a');
</script>

<div style="display:flex; flex-direction:column; gap:16px; align-items:flex-start">
  <div style="width: 360px">
    <Tabs {tabList} value={activeTab} onChange={(k) => (activeTab = k)} />
  </div>
  <Text type="tertiary">当前标签：{activeTab}</Text>

  <Tabs {tabList} type="card" value={activeTab} onChange={(k) => (activeTab = k)} />

  <Text type="tertiary">tabPosition=left + lazy（首次激活才挂载内容）：</Text>
  <div style="width: 420px" data-testid="tabs-left-lazy">
    <Tabs {tabList} tabPosition="left" lazy keepDOM value={activeTab} onChange={(k) => (activeTab = k)}>
      <TabPane itemKey="a"><div class="tab-pane-demo">账户内容</div></TabPane>
      <TabPane itemKey="b"><div class="tab-pane-demo">安全内容</div></TabPane>
      <TabPane itemKey="c"><div class="tab-pane-demo">通知内容</div></TabPane>
    </Tabs>
  </div>

  <Text type="tertiary">溢出滚动（窄容器 + 多标签，出现前/后滚动箭头）：</Text>
  <div style="width: 280px" data-testid="tabs-overflow">
    <Tabs
      tabList={overflowTabs}
      value={overflowActive}
      onChange={(k) => (overflowActive = k)}
    />
  </div>

  <Text type="tertiary">溢出收纳 overflow=dropdown（放不下的标签进末尾「更多」下拉，激活标签始终可见）：</Text>
  <div style="width: 280px" data-testid="tabs-overflow-dropdown">
    <Tabs
      tabList={overflowTabs}
      overflow="dropdown"
      value={dropdownTabActive}
      onChange={(k) => (dropdownTabActive = k)}
    />
  </div>

  <Text type="tertiary">type=button（分段按钮组）：</Text>
  <div data-testid="tabs-button">
    <Tabs
      type="button"
      tabList={tabList}
      value={buttonTabActive}
      onChange={(k) => (buttonTabActive = k)}
    />
  </div>

  <Text type="tertiary">addable（点「+」追加标签，当前 {addableTabs.length} 个）：</Text>
  <div style="width: 360px" data-testid="tabs-addable">
    <Tabs
      type="card"
      tabList={addableTabs}
      addable
      onAdd={addTab}
      value={addableActive}
      onChange={(k) => (addableActive = k)}
    />
  </div>

  <Text type="tertiary">纯声明式自动收集（不传 tabList，仅写 &lt;Tabs.Pane&gt;，标签栏自动推导）：</Text>
  <div style="width: 360px" data-testid="tabs-declarative">
    <Tabs value={declActive} onChange={(k) => (declActive = k)}>
      <TabPane itemKey="d1" tab="文档">
        <div class="tab-pane-demo">文档内容（声明式收集）</div>
      </TabPane>
      <TabPane itemKey="d2" tab="评论">
        <div class="tab-pane-demo">评论内容（声明式收集）</div>
      </TabPane>
      <TabPane itemKey="d3" tab="设置" disabled>
        <div class="tab-pane-demo">设置内容（禁用项）</div>
      </TabPane>
    </Tabs>
  </div>
  <Text type="tertiary">当前声明式标签：{declActive}</Text>

  <Text type="tertiary">renderTabBar（完全自绘标签栏）：</Text>
  <div style="width: 360px" data-testid="tabs-render-bar">
    <Tabs {tabList} value={renderBarActive} onChange={(k) => (renderBarActive = k)}>
      {#snippet renderTabBar(items, active, setActive)}
        <div style="display:flex; gap:8px; padding:4px 0;">
          {#each items as it (it.itemKey)}
            <Button
              size="small"
              type={it.itemKey === active ? 'primary' : 'tertiary'}
              disabled={it.disabled ?? false}
              onclick={() => setActive(it.itemKey)}
            >{it.tab}</Button>
          {/each}
        </div>
      {/snippet}
      <TabPane itemKey="a"><div class="tab-pane-demo">账户内容</div></TabPane>
      <TabPane itemKey="b"><div class="tab-pane-demo">安全内容</div></TabPane>
      <TabPane itemKey="c"><div class="tab-pane-demo">通知内容</div></TabPane>
    </Tabs>
  </div>
  <Text type="tertiary">当前自绘标签：{renderBarActive}</Text>
</div>

<style>
  :global(.tab-pane-demo) {
    padding: 12px;
    color: var(--cd-color-text-2);
  }
</style>
