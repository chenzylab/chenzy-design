import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fetchFileContent, fetchDirectoryList } from './fetch.js';

// 本地模式目录（CHENZY_MCP_LOCAL_DIR 逃生门本身也是被测对象）
let localRoot: string;

function okText(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'text/plain' },
  });
}
function okJson(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('fetch 层（网络模式，指定具体版本号避免 resolve-version 网络调用）', () => {
  beforeEach(() => {
    delete process.env.CHENZY_MCP_LOCAL_DIR;
    // 缓存目录隔离到临时 HOME，避免真实 ~/.chenzy-mcp 干扰/被污染
    process.env.HOME = mkdtempSync(join(tmpdir(), 'chenzy-mcp-test-'));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    rmSync(process.env.HOME!, { recursive: true, force: true });
  });

  it('双源 race：unpkg 成功即返回', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).includes('unpkg.com')) return okText('file content');
        return new Response('', { status: 404, statusText: 'Not Found' });
      }),
    );
    const content = await fetchFileContent(
      '@chenzy-design/svelte',
      '9.9.9',
      'dist/a.md',
    );
    expect(content).toBe('file content');
  });

  it('单源失败另一源兜底（npmmirror 胜出）', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).includes('unpkg.com'))
          return new Response('', { status: 500, statusText: 'ISE' });
        return okText('mirror content');
      }),
    );
    const content = await fetchFileContent(
      '@chenzy-design/svelte',
      '9.9.9',
      'dist/b.md',
    );
    expect(content).toBe('mirror content');
  });

  it('HTML 错误页被识别为失败', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => okText('<!DOCTYPE html><html>not found page</html>')),
    );
    await expect(
      fetchFileContent('@chenzy-design/svelte', '9.9.9', 'dist/c.md'),
    ).rejects.toThrow(/所有数据源都失败/);
  });

  it('双源全失败抛聚合错误', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () => new Response('', { status: 404, statusText: 'Not Found' }),
      ),
    );
    await expect(
      fetchFileContent('@chenzy-design/svelte', '9.9.9', 'dist/d.md'),
    ).rejects.toThrow(/所有数据源都失败/);
  });

  it('成功结果写缓存，第二次不再发请求', async () => {
    const spy = vi.fn(async (url: string) => {
      if (String(url).includes('unpkg.com')) return okText('cached content');
      return new Response('', { status: 404, statusText: 'Not Found' });
    });
    vi.stubGlobal('fetch', spy);
    await fetchFileContent('@chenzy-design/svelte', '9.9.9', 'dist/e.md');
    const callsAfterFirst = spy.mock.calls.length;
    const second = await fetchFileContent(
      '@chenzy-design/svelte',
      '9.9.9',
      'dist/e.md',
    );
    expect(second).toBe('cached content');
    expect(spy.mock.calls.length).toBe(callsAfterFirst); // 无新请求
  });

  it('目录列表：优先用文件更多的源', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const u = String(url);
        if (u.includes('unpkg.com')) {
          return okJson({
            files: [{ path: '/dist/a.js', type: 'text/javascript' }],
          });
        }
        // npmmirror 返回两个文件（更全）
        return okJson({
          path: '/',
          files: [
            { path: '/dist/a.js', type: 'text/javascript' },
            { path: '/dist/b.js', type: 'text/javascript' },
          ],
        });
      }),
    );
    const list = await fetchDirectoryList(
      '@chenzy-design/svelte',
      '9.9.9',
      'dist',
    );
    expect(list).toHaveLength(2);
  });
});

describe('本地模式（CHENZY_MCP_LOCAL_DIR）', () => {
  beforeEach(() => {
    localRoot = mkdtempSync(join(tmpdir(), 'chenzy-local-'));
    mkdirSync(join(localRoot, 'svelte/dist/button'), { recursive: true });
    writeFileSync(
      join(localRoot, 'svelte/dist/button/Button.svelte'),
      '<p>local</p>',
    );
    process.env.CHENZY_MCP_LOCAL_DIR = localRoot;
  });
  afterEach(() => {
    delete process.env.CHENZY_MCP_LOCAL_DIR;
    rmSync(localRoot, { recursive: true, force: true });
  });

  it('直接读本地文件，不发网络请求', async () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    const content = await fetchFileContent(
      '@chenzy-design/svelte',
      'latest',
      'dist/button/Button.svelte',
    );
    expect(content).toBe('<p>local</p>');
    expect(spy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('目录列表走本地 walk', async () => {
    const list = await fetchDirectoryList(
      '@chenzy-design/svelte',
      'latest',
      'dist',
    );
    expect(
      list.some(
        (e) => e.path === '/dist/button/Button.svelte' && e.type === 'file',
      ),
    ).toBe(true);
  });
});
