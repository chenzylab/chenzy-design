/**
 * 读取 @chenzy-design/tokens 的 token-manifest.json，暴露校验所需的
 * 合法 key 集合。口径见 build.ts。
 */
import manifest from '@chenzy-design/tokens/token-manifest.json' with { type: 'json' };

interface ManifestToken {
  name: string; // 带前缀，如 --cd-color-primary
  scope: string; // 'alias' | 'global' | 'component'
}

const tokens = (manifest as { tokens: ManifestToken[] }).tokens;

/** 所有存在的无前缀 token 名（--cd-<key> → <key>）。 */
export const allTokenKeys: ReadonlySet<string> = new Set(
  tokens.map((t) => t.name.replace(/^--cd-/, '')),
);

/**
 * 允许被主题包覆写的 key 集合。
 * 口径：主题包覆盖 Alias 层（spec §设计原则 2「覆盖 Alias token」）。
 * 放宽到同时允许 global 层（global 是 alias 的底层原子，如 palette / scales），
 * 但不允许覆写 component 层（组件 token 应通过 alias 级联，不直接改）。
 */
export const overridableKeys: ReadonlySet<string> = new Set(
  tokens
    .filter((t) => t.scope === 'alias' || t.scope === 'global')
    .map((t) => t.name.replace(/^--cd-/, '')),
);
