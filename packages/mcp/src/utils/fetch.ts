/**
 * 数据获取层（对齐 semi-mcp 的 fetch-file-content / fetch-directory-list）：
 * 同时向 unpkg 和 npmmirror 发请求，用第一个成功的结果，本地文件缓存。
 *
 * 开发期逃生门：设置环境变量 CHENZY_MCP_LOCAL_DIR 指向 monorepo 的 packages/
 * 目录时，跳过网络直接读本地文件（packages/<pkg-dir>/<filePath>），便于发布前
 * 用本地 dist 调试全部工具。
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  readCache,
  writeCache,
  getDirectoryListCacheDir,
  getFileContentCacheDir,
} from './file-cache.js';
import { resolveVersion } from './resolve-version.js';

export const UNPKG_BASE_URL = 'https://unpkg.com';
export const NPMMIRROR_BASE_URL = 'https://registry.npmmirror.com';

export interface DirEntry {
  path: string;
  type: string; // 'file' | 'directory'
}

// ---------------------------------------------------------------------------
// 本地模式（CHENZY_MCP_LOCAL_DIR）
// ---------------------------------------------------------------------------

/** @chenzy-design/<name> → monorepo packages/ 下的目录名 */
function localPkgDir(packageName: string): string {
  return packageName.replace(/^@chenzy-design\//, '');
}

function getLocalRoot(): string | null {
  return process.env.CHENZY_MCP_LOCAL_DIR || null;
}

function readLocalFile(packageName: string, filePath: string): string {
  const root = getLocalRoot()!;
  return readFileSync(join(root, localPkgDir(packageName), filePath), 'utf-8');
}

function listLocalDir(packageName: string, path: string): DirEntry[] {
  const root = getLocalRoot()!;
  const base = join(root, localPkgDir(packageName));
  const start = path ? join(base, path) : base;
  const result: DirEntry[] = [];
  const walk = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      const abs = join(dir, name);
      const rel = '/' + abs.slice(base.length + 1).split('\\').join('/');
      if (statSync(abs).isDirectory()) {
        result.push({ path: rel, type: 'directory' });
        walk(abs);
      } else {
        result.push({ path: rel, type: 'file' });
      }
    }
  };
  walk(start);
  return result;
}

// ---------------------------------------------------------------------------
// 文件内容
// ---------------------------------------------------------------------------

export async function fetchFileContentFromSource(
  baseUrl: string,
  packageName: string,
  version: string,
  filePath: string,
  isNpmMirror = false,
): Promise<string> {
  // npmmirror: /package/version/files/path；unpkg: /package@version/path
  const url = isNpmMirror
    ? `${baseUrl}/${packageName}/${version}/files/${filePath}`
    : `${baseUrl}/${packageName}@${version}/${filePath}`;

  const response = await fetch(url, { headers: { Accept: 'text/plain, application/json, */*' } });
  if (!response.ok) throw new Error(`获取文件失败: ${response.status} ${response.statusText}`);

  const content = await response.text();
  if (content.trim().startsWith('<!DOCTYPE html>') || content.includes('npmmirror 镜像站')) {
    throw new Error('返回了 HTML 错误页面');
  }
  return content;
}

export async function fetchFileContent(
  packageName: string,
  version: string,
  filePath: string,
): Promise<string> {
  if (getLocalRoot()) return readLocalFile(packageName, filePath);

  const resolvedVersion = await resolveVersion(packageName, version);
  const cacheKey = `${packageName}@${resolvedVersion}/${filePath}`;
  const cacheDir = getFileContentCacheDir();
  const cached = await readCache(cacheDir, cacheKey);
  if (cached) return cached;

  const unpkgPromise = fetchFileContentFromSource(UNPKG_BASE_URL, packageName, resolvedVersion, filePath, false);
  const npmmirrorPromise = fetchFileContentFromSource(NPMMIRROR_BASE_URL, packageName, resolvedVersion, filePath, true);

  // race 第一个成功者。注意不能照搬 semi-mcp 的「失败方转为永不 resolve」写法——
  // 双源全失败时 race 永不落定会挂死；用 Promise.any 语义：第一个成功者胜出，
  // 全失败时 any 才 reject，落到 allSettled 收集错误。
  const raceResult = await Promise.any([unpkgPromise, npmmirrorPromise]).catch(() => null);

  if (raceResult !== null) {
    await writeCache(cacheDir, cacheKey, raceResult);
    return raceResult;
  }

  const results = await Promise.allSettled([unpkgPromise, npmmirrorPromise]);
  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason)));
  throw new Error(`所有数据源都失败了: ${errors.join('; ')}`);
}

// ---------------------------------------------------------------------------
// 目录列表
// ---------------------------------------------------------------------------

function normalizeType(item: { path: string; type?: string }): DirEntry {
  const path = item.path;
  if (path.endsWith('/')) return { path, type: 'directory' };
  if (item.type && item.type.includes('/')) return { path, type: 'file' }; // MIME
  if (item.type === 'directory') return { path, type: 'directory' };
  return { path, type: 'file' };
}

interface NestedItem {
  path: string;
  type?: string;
  files?: NestedItem[];
}

function flattenNested(item: NestedItem, result: DirEntry[] = []): DirEntry[] {
  result.push(normalizeType(item));
  if (item.files) for (const f of item.files) flattenNested(f, result);
  return result;
}

/** npmmirror 嵌套结构里子目录 files 为空时需递归请求 */
async function fetchNpmMirrorDirectoryRecursive(
  baseUrl: string,
  packageName: string,
  version: string,
  path: string,
  maxDepth = 10,
): Promise<DirEntry[]> {
  if (maxDepth <= 0) return [];
  const url = `${baseUrl}/${packageName}/${version}/files/${path}/?meta`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`获取目录列表失败: ${response.status} ${response.statusText}`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new Error(`API 返回了非 JSON 格式: ${contentType}`);

  const data = (await response.json()) as NestedItem;
  const result: DirEntry[] = [];
  if (Array.isArray(data.files)) {
    const promises: Promise<DirEntry[]>[] = [];
    for (const item of data.files) {
      const normalized = normalizeType(item);
      result.push(normalized);
      if (normalized.type === 'directory' && (!item.files || item.files.length === 0)) {
        const subPath = normalized.path.startsWith('/') ? normalized.path.slice(1) : normalized.path;
        promises.push(
          fetchNpmMirrorDirectoryRecursive(baseUrl, packageName, version, subPath, maxDepth - 1)
            .then((subFiles) => subFiles.filter((f) => f.path !== normalized.path))
            .catch(() => []),
        );
      } else if (item.files?.length) {
        const flattened = flattenNested(item).filter((f) => f.path !== normalized.path);
        result.push(...flattened);
      }
    }
    if (promises.length) {
      for (const subFiles of await Promise.all(promises)) result.push(...subFiles);
    }
  }
  return result;
}

export async function fetchDirectoryListFromSource(
  baseUrl: string,
  packageName: string,
  version: string,
  path: string,
  isNpmMirror = false,
): Promise<DirEntry[]> {
  if (isNpmMirror) return fetchNpmMirrorDirectoryRecursive(baseUrl, packageName, version, path);

  const url = `${baseUrl}/${packageName}@${version}/${path}/?meta`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`获取目录列表失败: ${response.status} ${response.statusText}`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new Error(`API 返回了非 JSON 格式: ${contentType}`);

  const data = (await response.json()) as DirEntry[] | { files?: NestedItem[] } | NestedItem;
  if (Array.isArray(data)) return data.map(normalizeType);
  if (data && typeof data === 'object' && 'files' in data && Array.isArray(data.files)) {
    return data.files.map(normalizeType);
  }
  if (data && typeof data === 'object' && 'path' in data) {
    const single = data as NestedItem;
    if (single.files) return flattenNested(single).map((e) => e);
    return [normalizeType(single)];
  }
  throw new Error('无法解析目录列表数据格式');
}

export async function fetchDirectoryList(
  packageName: string,
  version: string,
  path: string,
): Promise<DirEntry[]> {
  if (getLocalRoot()) return listLocalDir(packageName, path);

  const resolvedVersion = await resolveVersion(packageName, version);
  const cacheKey = `${packageName}@${resolvedVersion}/${path}`;
  const cacheDir = getDirectoryListCacheDir();
  const cached = await readCache(cacheDir, cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as DirEntry[];
    } catch {
      // 缓存解析失败，忽略
    }
  }

  const results = await Promise.allSettled([
    fetchDirectoryListFromSource(UNPKG_BASE_URL, packageName, resolvedVersion, path, false),
    fetchDirectoryListFromSource(NPMMIRROR_BASE_URL, packageName, resolvedVersion, path, true),
  ]);

  const ok: { source: string; files: DirEntry[] }[] = [];
  const errors: string[] = [];
  if (results[0].status === 'fulfilled') ok.push({ source: 'unpkg', files: results[0].value });
  else errors.push(String(results[0].reason instanceof Error ? results[0].reason.message : results[0].reason));
  if (results[1].status === 'fulfilled') ok.push({ source: 'npmmirror', files: results[1].value });
  else errors.push(String(results[1].reason instanceof Error ? results[1].reason.message : results[1].reason));

  if (ok.length === 0) throw new Error(`所有数据源都失败了: ${errors.join('; ')}`);

  // 优先用文件更多的结果；数量相同 unpkg 优先
  ok.sort((a, b) => (b.files.length !== a.files.length ? b.files.length - a.files.length : a.source === 'unpkg' ? -1 : 1));
  const result = ok[0]!.files;
  await writeCache(cacheDir, cacheKey, JSON.stringify(result));
  return result;
}
