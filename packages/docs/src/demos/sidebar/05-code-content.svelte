<script lang="ts">
  // 对齐 Semi「代码展示」段：用 SideBarCodeItem 展示单条代码/JSON 内容
  // （不含折叠头，仅内容区），配合 RadioGroup 切换 JSON / CSS 两种内容。
  import { SideBarCodeItem, RadioGroup, Radio } from '@chenzy-design/svelte';
  import type { CodeItemProps } from '@chenzy-design/svelte';

  // 数据照搬 Semi md CodeItem 用例（json/codeProps 常量）。
  const jsonProps: CodeItemProps = {
    key: 'json',
    isJson: true,
    content: JSON.stringify(
      {
        axisX: {
          title: { visible: false, position: 'center' },
          label: {
            visible: true,
            style: {
              fontSize: 12,
              fontWeight: 400,
              lineHeight: 16,
              fontFamily: ['Inter'],
              fill: 'rgba(0, 0, 0, 0.47843137254901963)',
            },
            space: 12,
          },
        },
      },
      null,
      4,
    ),
  };

  const cssProps: CodeItemProps = {
    key: 'css',
    language: 'css',
    content: `.semi-animation-react-demo-auto {
    button {
        height: 50px;
        border: 0;
        cursor: pointer !important;
        background: #777;
        color: white;
        outline: none;
        -webkit-appearance: none;
    }

    button:hover {
        background: #878787;
    }

    .auto-main {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: auto 1fr;
        background: #575757;
    }

    .content {
        grid-column: span 3;
    }

    .item {
        background: indianred;
        width: 100%;
        overflow: hidden;
        color: white;
    }

    .item p {
        margin: 0;
        padding: 10px;
    }
}
`,
  };

  let type = $state<'json' | 'css'>('json');
</script>

<RadioGroup
  type="button"
  buttonSize="middle"
  value={type}
  onChange={(e) => (type = e.target.value as 'json' | 'css')}
>
  <Radio value="json">JSON</Radio>
  <Radio value="css">CSS</Radio>
</RadioGroup>

<div style="height: 200px; overflow: auto; margin-top: 10px;">
  <SideBarCodeItem code={type === 'json' ? jsonProps : cssProps} />
</div>
