/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/components/basic/Space.spec.md.
 */
export const meta = {
  name: 'Space',
  category: 'basic',
  description: '为子元素提供统一间距的 flex 容器。',
  props: [
    { name: 'direction', type: "'horizontal'|'vertical'", default: "'horizontal'" },
    {
      name: 'spacing',
      type: "'tight'|'medium'|'loose'|number|[number,number]",
      default: "'medium'",
      desc: '档位映射 token，number→px，数组→[行,列] gap',
    },
    { name: 'align', type: "'start'|'end'|'center'|'baseline'", default: 'undefined' },
    { name: 'wrap', type: 'boolean', default: 'false' },
    { name: 'block', type: 'boolean', default: 'false', desc: 'true→display:flex 占满宽度' },
    { name: 'class', type: 'string', default: "''" },
  ],
  events: [],
  slots: [{ name: 'children', desc: '需要间距的子元素' }],
  a11y: { role: 'none', note: '纯布局容器，不引入语义' },
  tokens: ['--cd-space-tight', '--cd-space-medium', '--cd-space-loose'],
  examples: [{ title: '横向', code: '<Space><Button>A</Button><Button>B</Button></Space>' }],
} as const;
