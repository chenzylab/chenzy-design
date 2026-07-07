<script lang="ts">
  import { Text, Paragraph } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <div style="width: 200px;">
    <Text ellipsis>这是一段很长的单行文本，超出容器宽度后会自动以省略号结尾。</Text>
  </div>
  <div style="width: 200px;">
    <Text ellipsis={{ showTooltip: true }}>
      这段单行省略文本鼠标悬浮时会以浮层显示完整内容，方便阅读全部信息。
    </Text>
  </div>
  <div style="width: 300px;">
    <Paragraph ellipsis={{ rows: 3 }}>
      这是一段较长的多行文本，用于演示多行省略效果。当文本内容超过设定的行数时，
      会在末尾以省略号截断。chenzy-design 的 Typography 组件对齐 Semi Design 的能力，
      支持灵活的省略配置，满足各种排版场景的需求。
    </Paragraph>
  </div>
  <div style="width: 300px;">
    <Paragraph ellipsis={{ suffix: '——完' }}>
      这是一段带自定义后缀的省略文本，截断时会保留后缀内容，常用于展示带固定结尾的长文本描述信息内容。
    </Paragraph>
  </div>
</div>
