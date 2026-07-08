// Upload a11y：触发按钮/拖拽区 locale 可访问名；文件列表删除按钮可访问名。
// 经 UploadA11yFixture 渲染（harness 注入的空 children 插槽会命中 Upload 的
// {#if children} 分支，吞掉内置 locale 文案 → 触发按钮空名，故走 fixture 绕过）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import type { Component } from 'svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import Fixture from './UploadA11yFixture.svelte';
import type { UploadFileItem } from './types.js';

type AnyComponent = Component<Record<string, unknown>>;
const renderFixture = (props: Record<string, unknown> = {}) =>
  render(Fixture as unknown as AnyComponent, { props });

describe('Upload a11y', () => {
  it('默认渲染：触发按钮有 locale 文本可访问名，无 axe violations', async () => {
    const { container } = renderFixture();
    const trigger = container.querySelector('.cd-upload__trigger');
    expect(trigger).not.toBeNull();
    // 触发按钮可访问名来自 en_US locale（Upload.trigger = 'Select file'）。
    expect(trigger?.textContent?.trim()).toBeTruthy();
    expect(trigger?.textContent?.trim()).not.toBe('Upload.trigger');
    await expectNoAxeViolations(container);
  });

  it('drag 模式：拖拽区 role=button + locale 文本，无 axe violations', async () => {
    const { container } = renderFixture({ drag: true });
    const dragger = container.querySelector('.cd-upload__dragger');
    expect(dragger?.getAttribute('role')).toBe('button');
    expect(dragger?.textContent?.trim()).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('文件列表（success/uploadFail 项）：删除按钮 locale 可访问名，无 axe violations', async () => {
    const files: UploadFileItem[] = [
      { uid: 'u1', name: 'doc.pdf', size: 4096, status: 'success', percent: 100 },
      { uid: 'u2', name: 'big.zip', size: 8192, status: 'uploadFail', error: 'Too large' },
    ];
    const { container } = renderFixture({ value: files });
    const removeBtns = container.querySelectorAll('.cd-upload__item-remove');
    expect(removeBtns.length).toBe(2);
    const label = removeBtns[0]?.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).not.toBe('Upload.remove');
    await expectNoAxeViolations(container);
  });

  // uploading 文件项内嵌 Progress 现传入关联文件名的 ariaLabel（Upload.uploadingProgress），
  // progressbar 有可访问名，无 aria-progressbar-name 违规。
  it('uploading 项：内嵌 Progress 有文件名关联可访问名，无 axe violations', async () => {
    const files: UploadFileItem[] = [
      { uid: 'u1', name: 'photo.png', size: 2048, status: 'uploading', percent: 40 },
    ];
    const { container } = renderFixture({ value: files });
    expect(container.querySelector('[role="progressbar"]')).not.toBeNull();
    await expectNoAxeViolations(container);
  });
});
