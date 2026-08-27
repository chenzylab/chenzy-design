/**
 * 版本号解析：将 "latest" 等标签解析为实际版本号（对齐 semi-mcp resolve-version）。
 *
 * 缓存策略：每天只在第一次调用时查询 npm registry，当天后续调用使用缓存版本号。
 */
import { join } from 'node:path';
import { lt } from 'semver';
import { readCache, writeCache, getCacheDir } from './file-cache.js';

/**
 * 最低支持版本：首个随包发布 dist/content 文档的 @chenzy-design/svelte 版本。
 * 低于此版本的请求自动 fallback 到 latest（旧包里没有 content，查了也是 404）。
 */
export const MIN_SUPPORTED_VERSION = '0.5.0';

interface VersionCacheData {
  version: string;
  date: string; // YYYY-MM-DD
}

function getVersionCacheDir(): string {
  return join(getCacheDir(), 'version');
}

function getCurrentDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

async function fetchVersionFromRegistry(
  packageName: string,
  tag: string,
): Promise<string> {
  const registries = [
    `https://registry.npmmirror.com/${packageName}/${tag}`,
    `https://registry.npmjs.org/${packageName}/${tag}`,
  ];
  let lastError: Error | null = null;
  for (const url of registries) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as { version?: string };
      if (data?.version) return data.version;
      throw new Error('响应中没有 version 字段');
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  throw new Error(
    `无法获取 ${packageName}@${tag} 的版本号: ${lastError?.message}`,
  );
}

export async function resolveVersion(
  packageName: string,
  version: string,
): Promise<string> {
  if (/^\d+\.\d+\.\d+/.test(version)) {
    if (lt(version, MIN_SUPPORTED_VERSION)) {
      version = 'latest'; // 过旧版本没有 content 产物，落到 latest
    } else {
      return version;
    }
  }

  const cacheDir = getVersionCacheDir();
  const cacheKey = `${packageName}@${version}`;
  const today = getCurrentDate();

  const cachedContent = await readCache(cacheDir, cacheKey);
  if (cachedContent) {
    try {
      const cached = JSON.parse(cachedContent) as VersionCacheData;
      if (cached.date === today) return cached.version;
    } catch {
      // 缓存解析失败，忽略
    }
  }

  const resolvedVersion = await fetchVersionFromRegistry(packageName, version);
  await writeCache(
    cacheDir,
    cacheKey,
    JSON.stringify({
      version: resolvedVersion,
      date: today,
    } satisfies VersionCacheData),
  );
  return resolvedVersion;
}
