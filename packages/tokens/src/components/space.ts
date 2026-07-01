/** Component tokens for Space. See specs/components/basic/Space.spec.md. */
export const spaceTokens = {
  'space-tight': 'var(--cd-spacing-tight)', // Semi space-tight = spacing-tight(8)
  'space-medium': 'var(--cd-spacing-base)', // Semi space-medium = spacing-base(16)（原 base-tight 12）
  'space-loose': 'var(--cd-spacing-loose)', // Semi space-loose = spacing-loose(24)（原 base 16）
} as const;
