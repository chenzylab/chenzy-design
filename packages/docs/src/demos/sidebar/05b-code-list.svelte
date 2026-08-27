<script lang="ts">
  // 对齐 Semi「代码列表」段：用 SideBarCodeContent 直接展示代码列表信息
  // （不套 SideBarContainer，独立可用），activeKey/onChange 受控管理展开态。
  import { SideBarCodeContent } from '@chenzy-design/svelte';
  import type { CodeItemProps } from '@chenzy-design/svelte';

  // 数据照搬 Semi md defaultCodes（3 条：javascript/css/json，isJson 项 language 仍为 'html'）。
  const codes: CodeItemProps[] = [
    {
      key: 'code1',
      name: 'Component.js',
      language: 'javascript',
      content: `import React from 'react';
import { AutoComplete } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';

() => {
    const [stringData, setStringData] = useState([]);
    const [value, setValue] = useState('');
    const handleStringSearch = (value) => {
        let result;
        if (value) {
            result = ['gmail.com', '163.com', 'qq.com'].map(domain => value+domain);
        } else {
            result = [];
        }
        setStringData(result);
    };

    const handleChange = (value) => {
        console.log('onChange', value);
        setValue(value);
    };
    return (
        <AutoComplete
            data={stringData}
            value={value}
            showClear
            prefix={<IconSearch />}
            placeholder="搜索... "
            onSearch={handleStringSearch}
            onChange={handleChange}
            style={{ width: 200 }}
        />
    );
};
`,
    },
    {
      key: 'code2',
      name: 'Style.css',
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
    },
    {
      key: 'code3',
      name: 'Chart.json',
      isJson: true,
      language: 'html',
      content: `{
    "axisX": {
        "title": {
            "visible": false,
            "position": "center"
        },
        "label": {
            "visible": true,
            "style": {
                "fontSize": 12,
                "fontWeight": 400,
                "lineHeight": 16,
                "fontFamily": [
                    "Inter"
                ],
                "fill": "rgba(0, 0, 0, 0.47843137254901963)"
            },
            "space": 12
        },
        "domainLine": {
            "visible": true,
            "style": {
                "lineWidth": 1,
                "stroke": "rgba(0, 0, 0, 0.12156862745098039)",
                "lineDash": []
            }
        },
        "tick": {
            "visible": false,
            "style": {
                "lineWidth": 1,
                "stroke": "rgba(255, 255, 255, 0)"
            }
        },
        "subTick": {
            "visible": false
        },
        "grid": {
            "visible": false
        },
        "subGrid": {
            "visible": false
        }
    }
}`,
    },
  ];

  let activeKey = $state<string[]>(['code1']);
</script>

<SideBarCodeContent {codes} {activeKey} onChange={(keys) => (activeKey = keys)} />
