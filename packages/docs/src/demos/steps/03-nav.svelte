<script lang="ts">
  import { Steps } from '@chenzy-design/svelte';
</script>

<div style="display: flex; justify-content: center;">
  <Steps
    type="nav"
    current={1}
    steps={[
      { title: '注册账号' },
      { title: '这个项目的文字比较多多多多' },
      { title: '产品用途' },
      { title: '期待尝试功能' },
    ]}
  />
</div>
