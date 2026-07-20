// FormInputGroup + hooks（getFieldApi/useFormApi/useFormState）测试。
// 覆盖：
//  - 组内 Field 走 isInInputGroup 模式（不各自渲 label），Label 只在 group 级出现一次；
//  - GroupError 聚合组内字段错误（提交校验失败后组下方出现聚合错误）；
//  - getFieldApi setValue/setError/setTouched/getValue/getError/getTouched 闭包生效；
//  - useFormApi 在后代拿到句柄。
import { describe, it, expect } from 'vitest';
import { tick } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import FormInputGroupFixture from './FormInputGroupFixture.svelte';

describe('Form.InputGroup + hooks', () => {
  it('组内字段走 group 模式：Label 只在 group 级渲染一次，组内字段不各自渲 label', () => {
    const { container } = renderWithLocale(FormInputGroupFixture, {});
    // 组内两个字段仍注册（data-field 存在），但都进入 group 模式：不渲染 .cd-form-field wrapper。
    // group 级 label 文本只出现一次。
    const labels = [...container.querySelectorAll('label')].filter((l) =>
      l.textContent?.includes('Contact'),
    );
    expect(labels.length).toBe(1);
    // 组内字段没有各自的 field wrapper（isInInputGroup 分支不渲 .cd-form-field）。
    expect(container.querySelector('.cd-form-field[data-field="areaCode"]')).toBeNull();
    // 两个控件仍在 DOM（数据流接管）。
    expect(container.querySelectorAll('.cd-input-group input').length).toBe(2);
  });

  it('useFormApi 在后代拿到句柄', () => {
    const { getByTestId } = renderWithLocale(FormInputGroupFixture, {});
    expect(getByTestId('has-api').textContent).toBe('yes');
  });

  it('getFieldApi.setValue → getValue / useFormState 反映新值', async () => {
    const { getByTestId } = renderWithLocale(FormInputGroupFixture, {});
    expect(getByTestId('area-value').textContent).toBe('');
    getByTestId('set-value').click();
    await tick();
    expect(getByTestId('area-value').textContent).toBe('+86');
  });

  it('getFieldApi.setError → getError 反映错误（依赖批A setError）', async () => {
    const { getByTestId } = renderWithLocale(FormInputGroupFixture, {});
    expect(getByTestId('area-error').textContent).toBe('');
    getByTestId('set-error').click();
    await tick();
    // reactive 展示（formState.errors）反映 getFieldApi.setError 塞入的错误（端到端验证 setError 生效）。
    expect(getByTestId('area-error').textContent).toBe('forced error');
  });

  it('getFieldApi.setTouched → getTouched 反映 touched', async () => {
    const { getByTestId } = renderWithLocale(FormInputGroupFixture, {});
    expect(getByTestId('area-touched').textContent).toBe('untouched');
    getByTestId('set-touched').click();
    await tick();
    expect(getByTestId('area-touched').textContent).toBe('touched');
  });

  it('GroupError 聚合：塞入字段错误后组下方出现聚合错误块', async () => {
    const { getByTestId, container } = renderWithLocale(FormInputGroupFixture, {});
    getByTestId('set-error').click();
    await tick();
    // group 级 error 块（isInInputGroup → cd-form-field-error-message）聚合了该错误。
    const errBlock = container.querySelector('.cd-form-field-group .cd-form-field-error-message');
    expect(errBlock).not.toBeNull();
    expect(errBlock?.textContent).toContain('forced error');
  });

  it('整个 InputGroup 表单：无 axe violations', async () => {
    const { container } = renderWithLocale(FormInputGroupFixture, {});
    await expectNoAxeViolations(container);
  });
});
