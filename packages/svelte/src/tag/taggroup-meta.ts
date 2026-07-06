/**
 * Machine-readable component metadata for AI/docs consumption.
 * TagGroup — see specs/components/show/TagGroup.spec.md
 */
export const meta = {
  name: 'TagGroup',
  category: 'show',
  relatedTo: 'Tag',
  semiEquivalent: 'TagGroup',
  description:
    '标签组：一组 Tag 成组渲染，超过 maxTagCount 折叠剩余为「+N」标签，hover 在 Popover 弹层展示被折叠项；数据驱动(tagList)或子元素(children)两种用法。复用 Tag/Popover。',
  exports: ['TagGroup'],
  props: [
    { name: 'tagList', type: 'TagItem[]', default: 'undefined', desc: '数据驱动的标签数据（与 children 二选一）' },
    { name: 'maxTagCount', type: 'number', default: 'undefined', desc: '最多展示的标签数，超出折叠为 +N' },
    { name: 'restCount', type: 'number', default: 'undefined', desc: '直接指定折叠数量（覆盖自动计算）' },
    { name: 'size', type: "'small'|'default'|'large'", default: "'default'", desc: '标签尺寸（透传各 Tag）' },
    { name: 'avatarShape', type: "'circle'|'square'", default: 'undefined', desc: '标签内头像形状（透传）' },
    { name: 'showPopover', type: 'boolean', default: 'true', desc: '+N 是否 hover 弹层展示剩余' },
    { name: 'popoverProps', type: 'PopoverProps', default: 'undefined', desc: '弹层透传（复用本库 Popover）' },
    {
      name: 'onTagClose',
      type: '(tagKey, index) => void',
      default: 'undefined',
      desc: '关闭某标签回调',
    },
    { name: 'onPlusNMouseEnter', type: '() => void', default: 'undefined', desc: '鼠标进入 +N 回调' },
    { name: 'class', type: 'string', default: 'undefined', desc: '透传根类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '透传根内联样式' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '子 Tag（与 tagList 二选一）' },
  ],
  events: [
    { name: 'onTagClose', desc: '关闭某标签' },
    { name: 'onPlusNMouseEnter', desc: '鼠标进入 +N' },
  ],
  slots: [{ name: 'children', desc: '子 Tag（与 tagList 二选一）' }],
  a11y: {
    hasRole: true,
    focusable: true,
    note: '组容器 role=group；+N 标签带 aria-label「还有 N 个标签」（i18n TagGroup.restTagsAriaLabel），弹层复用 Popover 键盘/Esc。',
  },
  tokens: ['--cd-taggroup-gap'],
  responsive: false,
  examples: [
    {
      title: '数据驱动',
      code: "<TagGroup tagList={[{ children: 'A' }, { children: 'B' }]} />",
    },
    {
      title: '折叠 +N',
      code: "<TagGroup maxTagCount={2} tagList={tags} />",
    },
  ],
} as const;
