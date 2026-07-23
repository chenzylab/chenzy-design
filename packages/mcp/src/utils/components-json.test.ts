import { describe, it, expect } from 'vitest';
import { flatName, resolveComponent, renderComponentList, type ComponentsManifest } from './components-json.js';

const manifest: ComponentsManifest = {
  version: '1.0.0',
  count: 3,
  components: {
    Button: {
      name: 'Button',
      category: 'basic',
      description: '按钮组件。触发操作。',
      subComponents: [{ name: 'ButtonGroup' }, { name: 'SplitButtonGroup' }],
    },
    BackTop: { name: 'BackTop', category: 'other', description: '回到顶部。' },
    List: { name: 'List', category: 'show', description: '列表。', subComponents: ['List.Item'] },
  },
};

describe('flatName', () => {
  it('去连字符全小写', () => {
    expect(flatName('BackTop')).toBe('backtop');
    expect(flatName('back-top')).toBe('backtop');
    expect(flatName('date_picker')).toBe('datepicker');
  });
});

describe('resolveComponent', () => {
  it('精确/kebab/大小写归一化匹配', () => {
    expect(resolveComponent(manifest, 'Button')?.metaName).toBe('Button');
    expect(resolveComponent(manifest, 'back-top')?.metaName).toBe('BackTop');
    expect(resolveComponent(manifest, 'BACKTOP')?.metaName).toBe('BackTop');
    expect(resolveComponent(manifest, 'BackTop')?.docName).toBe('backtop');
  });

  it('subComponents 对象形态反查', () => {
    const r = resolveComponent(manifest, 'ButtonGroup');
    expect(r?.metaName).toBe('Button');
    expect(r?.viaSubComponent).toBe('ButtonGroup');
  });

  it('subComponents 字符串形态（List.Item）不崩溃且可反查', () => {
    const r = resolveComponent(manifest, 'ListItem');
    expect(r?.metaName).toBe('List');
    expect(r?.viaSubComponent).toBe('List.Item');
  });

  it('未知组件返回 null（不抛异常）', () => {
    expect(resolveComponent(manifest, 'NoSuchComp')).toBeNull();
  });
});

describe('renderComponentList', () => {
  it('输出含名称/分类/首句简介', () => {
    const out = renderComponentList(manifest);
    expect(out).toContain('共 3 个');
    expect(out).toContain('- Button (basic): 按钮组件');
    expect(out).not.toContain('触发操作'); // 只取首句
  });
});
