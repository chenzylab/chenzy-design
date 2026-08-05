// Typography size 继承（对齐 Semi typography/context.tsx SizeContext）。
// 供各子组件把自身实际 size 下传，size='inherit' 时读回。
import { getContext, setContext } from 'svelte';

const SIZE_CTX = Symbol('cd-typography-size');

export function setParentSize(size: 'normal' | 'small'): void {
  setContext(SIZE_CTX, size);
}
export function getParentSize(): 'normal' | 'small' {
  return getContext<'normal' | 'small'>(SIZE_CTX) ?? 'normal';
}
