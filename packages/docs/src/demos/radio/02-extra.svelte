<script lang="ts">
  import { Radio } from '@chenzy-design/svelte';
</script>

<!-- 通过 extra 设置辅助文本（仅 type=default 生效） -->
<Radio
  value="semi"
  extra="Semi Design 是由抖音前端团队与 UED 团队共同设计开发并维护的设计系统"
  ariaLabel="单选示例"
  name="demo-radio-extra"
>
  Semi Design
</Radio>
