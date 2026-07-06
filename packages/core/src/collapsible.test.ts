import { describe, it, expect } from 'vitest';
import {
  collapsibleShouldRender,
  collapsibleCollapsedHeight,
  type CollapsibleRenderInput,
} from './collapsible.js';

function input(partial: Partial<CollapsibleRenderInput>): CollapsibleRenderInput {
  return {
    isOpen: false,
    keepDOM: false,
    lazyRender: false,
    collapseHeight: 0,
    visible: false,
    hasBeenRendered: false,
    ...partial,
  };
}

describe('collapsibleShouldRender', () => {
  it('默认（全 false）：完全折叠不渲染', () => {
    expect(collapsibleShouldRender(input({}))).toBe(false);
  });

  it('isOpen=true：渲染', () => {
    expect(collapsibleShouldRender(input({ isOpen: true }))).toBe(true);
  });

  it('visible=true（折叠过渡进行中）：仍渲染', () => {
    expect(collapsibleShouldRender(input({ visible: true }))).toBe(true);
  });

  it('keepDOM 非 lazyRender：折叠也常驻', () => {
    expect(collapsibleShouldRender(input({ keepDOM: true }))).toBe(true);
  });

  it('keepDOM + lazyRender：首展前（hasBeenRendered=false）不渲染', () => {
    expect(
      collapsibleShouldRender(input({ keepDOM: true, lazyRender: true })),
    ).toBe(false);
  });

  it('keepDOM + lazyRender：首展后（hasBeenRendered=true）常驻', () => {
    expect(
      collapsibleShouldRender(
        input({ keepDOM: true, lazyRender: true, hasBeenRendered: true }),
      ),
    ).toBe(true);
  });

  it('keepDOM + lazyRender + isOpen：即使 hasBeenRendered=false，isOpen 也强制渲染', () => {
    expect(
      collapsibleShouldRender(
        input({ keepDOM: true, lazyRender: true, isOpen: true }),
      ),
    ).toBe(true);
  });

  it('collapseHeight>0：折叠仍渲染（保留部分高度）', () => {
    expect(collapsibleShouldRender(input({ collapseHeight: 40 }))).toBe(true);
  });

  it('lazyRender 无 keepDOM：折叠不渲染，isOpen 才渲染', () => {
    expect(collapsibleShouldRender(input({ lazyRender: true }))).toBe(false);
    expect(collapsibleShouldRender(input({ lazyRender: true, isOpen: true }))).toBe(
      true,
    );
  });
});

describe('collapsibleCollapsedHeight', () => {
  it('非自适应：直接返回 collapseHeight', () => {
    expect(collapsibleCollapsedHeight(40, false, 200)).toBe(40);
    expect(collapsibleCollapsedHeight(40, false, 10)).toBe(40);
  });

  it('自适应：不超过实测内容高度', () => {
    expect(collapsibleCollapsedHeight(40, true, 200)).toBe(40);
    expect(collapsibleCollapsedHeight(40, true, 10)).toBe(10);
  });

  it('自适应但未测量（domHeight=0）：返回 0', () => {
    expect(collapsibleCollapsedHeight(40, true, 0)).toBe(0);
  });
});
