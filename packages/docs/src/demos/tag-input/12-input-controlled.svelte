<script lang="ts">
  import { TagInput, Text } from '@chenzy-design/svelte';

  // 输入受控：inputValue 由外部驱动，键入仅触发 onInputChange（此处强制大写）。
  let tags = $state<string[]>(['SVELTE']);
  let input = $state('');
</script>

<div style="width: 320px">
  <TagInput
    value={tags}
    inputValue={input}
    placeholder="输入自动转大写，回车添加"
    onChange={(t) => (tags = t)}
    onInputChange={(v) => (input = v.toUpperCase())}
  />
  <Text type="tertiary">当前输入：{input || '（空）'}</Text>
  <Text type="tertiary">标签：{tags.join(' / ') || '（无）'}</Text>
</div>
