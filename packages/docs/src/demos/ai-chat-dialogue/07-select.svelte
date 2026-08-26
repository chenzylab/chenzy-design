<script lang="ts">
  import { AIChatDialogue, RadioGroup, Radio } from '@chenzy-design/svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/svelte';

  // avatar 对齐 Semi demo（roleConfig 各角色均配真实头像图片）。
  const roleConfig: AIDialogueRoleConfig = {
    user: {
      name: '我',
      color: '#4080ff',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png',
    },
    assistant: {
      name: '助手',
      color: '#00b42a',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
  };

  const chats: AIDialogueMessage[] = [
    {
      id: 'u1',
      role: 'user',
      content: [{ type: 'message', content: [{ type: 'input_text', text: '第一条消息' }] }],
      status: 'completed',
    },
    {
      id: 'a1',
      role: 'assistant',
      content: [{ type: 'message', content: [{ type: 'output_text', text: '第二条消息（助手）。' }] }],
      status: 'completed',
    },
    {
      id: 'u2',
      role: 'user',
      content: [{ type: 'message', content: [{ type: 'input_text', text: '第三条消息' }] }],
      status: 'completed',
    },
  ];

  // 对齐 Semi 官方「选择」demo 的三个控制维度（会话布局方式 / 是否开启选择 / 选择方式），
  // 都用 RadioGroup type="button" 风格统一，不是裸 button——本库原来只有前两个维度里的
  // 布局切换用了 RadioGroup，「是否开启选择」这个开关本身缺失（selecting 硬编码恒为
  // true，无法演示关闭态），全选/取消全选也是裸 button，跟 Semi 三行统一风格不一致。
  // Semi demo 挂载时默认调用一次 selectAll()（useEffect 空依赖数组），故初始即全选态。
  // 用 untrack 只在 dialogue 首次绑定时调用一次——selectAll() 内部会更新组件的
  // selectedIds 状态，若不加 untrack，$effect 对这条更新链路的响应式读取会形成
  // 依赖，反过来触发 $effect 自己重新执行，造成 effect_update_depth_exceeded 死循环
  // （真机 console 报错复现：selectAll → $effect → selectAll → ... 无限递归，
  // 页面陷入错误态后所有交互，包括「关闭」单选点击都失效——这才是点击无反应的真因，
  // 不是 RadioGroup/事件系统的 bug）。
  let dialogue = $state<{ selectAll: () => void; deselectAll: () => void }>();
  let selected = $state<string[]>([]);
  let align = $state<'leftRight' | 'leftAlign'>('leftRight');
  let select = $state(true);
  let selection = $state<'allSelect' | 'cancelSelect'>('allSelect');

  let didInitSelectAll = false;
  $effect(() => {
    if (didInitSelectAll || !dialogue) return;
    didInitSelectAll = true;
    dialogue.selectAll();
  });

  function onSelectionChange(value: 'allSelect' | 'cancelSelect'): void {
    selection = value;
    if (value === 'allSelect') dialogue?.selectAll();
    else dialogue?.deselectAll();
  }
</script>

<span style="display:flex; flex-direction:column; row-gap:8px; margin-bottom: 10px;">
  <span style="display:flex; align-items:center; column-gap:10px;">
    会话布局方式
    <RadioGroup value={align} onChange={(e) => (align = e.target.value as 'leftRight' | 'leftAlign')} type="button">
      <Radio value="leftRight">左右分布</Radio>
      <Radio value="leftAlign">左对齐</Radio>
    </RadioGroup>
  </span>
  <span style="display:flex; align-items:center; column-gap:10px;">
    是否开启选择
    <RadioGroup value={select} onChange={(e) => (select = e.target.value as boolean)} type="button">
      <Radio value={true}>开启</Radio>
      <Radio value={false}>关闭</Radio>
    </RadioGroup>
  </span>
  <span style="display:flex; align-items:center; column-gap:10px;">
    选择方式
    <RadioGroup
      value={selection}
      onChange={(e) => onSelectionChange(e.target.value as 'allSelect' | 'cancelSelect')}
      type="button"
    >
      <Radio value="allSelect">全选</Radio>
      <Radio value="cancelSelect">取消全选</Radio>
    </RadioGroup>
  </span>
</span>
<div style="height: 360px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue
    bind:this={dialogue}
    {chats}
    {roleConfig}
    {align}
    mode="bubble"
    selecting={select}
    onSelect={(ids) => (selected = ids)}
  />
</div>
