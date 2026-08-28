<script lang="ts">
  // 一键把 chenzy-design-skills.zip 写入本地项目目录，对齐 Semi SkillsWriter
  // （~/i/semi-design/src/components/SkillsWriter）：File System Access API 选目录 +
  // 解压写入，仅 Chromium 内核浏览器支持（showDirectoryPicker）。
  // 解压用 fflate（本库 zip 构建脚本 build-skills-zip.ts 同款，无需引入 jszip）。
  import { unzipSync } from 'fflate';
  import { Checkbox, CheckboxGroup, Button, Card } from '@chenzy-design/svelte';
  import { base } from '$app/paths';

  interface ClientOption {
    id: string;
    label: string;
    path: string;
    desc: string;
  }

  const clientOptions: ClientOption[] = [
    { id: 'claudeCode', label: 'Claude Code', path: '.claude/skills/', desc: 'Anthropic 官方 CLI' },
    { id: 'cursor', label: 'Cursor', path: '.cursor/skills/', desc: 'AI 增强代码编辑器' },
    { id: 'trae', label: 'Trae', path: '.trae/skills/', desc: '字节跳动 AI 原生编程 IDE' },
    { id: 'standard', label: '通用标准', path: '.skills/', desc: '未列出的工具可尝试此路径' },
  ];

  // CheckboxValue（string | number）未从包根导出，就地声明避免额外依赖导出面。
  let selected = $state<(string | number)[]>([]);
  let loading = $state(false);
  let message = $state<string | null>(null);
  let messageType = $state<'success' | 'error'>('success');

  const supported = $derived(typeof window !== 'undefined' && 'showDirectoryPicker' in window);

  // zip 内固定前缀（build-skills-zip.ts 打包产物），解压后按此前缀取文件写入目标目录。
  const ZIP_ROOT = 'chenzy-design-guide/';

  async function getOrCreateDir(parent: FileSystemDirectoryHandle, name: string): Promise<FileSystemDirectoryHandle> {
    return parent.getDirectoryHandle(name, { create: true });
  }

  async function writeFile(dir: FileSystemDirectoryHandle, relPath: string, content: Uint8Array) {
    const parts = relPath.split('/').filter(Boolean);
    const fileName = parts.pop()!;
    let cur = dir;
    for (const part of parts) cur = await getOrCreateDir(cur, part);
    const fileHandle = await cur.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    // fflate 的 Uint8Array 底层 buffer 类型是 ArrayBufferLike（含 SharedArrayBuffer 可能性），
    // FileSystemWritableFileStream.write 要求确定的 ArrayBuffer，slice 拷贝一份消除类型不确定性。
    await writable.write(content.slice().buffer);
    await writable.close();
  }

  async function addToProject() {
    if (selected.length === 0) {
      message = '请至少选择一个编程工具';
      messageType = 'error';
      return;
    }
    if (!supported) {
      message = '当前浏览器不支持此功能，请使用 Chrome / Edge，或改用下方下载方式';
      messageType = 'error';
      return;
    }

    let rootHandle: FileSystemDirectoryHandle;
    try {
      rootHandle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return; // 用户取消选择
      message = `选择目录失败：${err instanceof Error ? err.message : String(err)}`;
      messageType = 'error';
      return;
    }

    loading = true;
    message = null;
    try {
      const response = await fetch(`${base}/chenzy-design-skills.zip`);
      if (!response.ok) throw new Error(`下载 skills.zip 失败（${response.status}）`);
      const buf = new Uint8Array(await response.arrayBuffer());
      const entries = unzipSync(buf);

      const zipFiles = Object.entries(entries).filter(([path]) => path.startsWith(ZIP_ROOT) && !path.endsWith('/'));
      if (zipFiles.length === 0) throw new Error('zip 内未找到预期的技能文件');

      const targetPaths = clientOptions.filter((o) => selected.includes(o.id)).map((o) => o.path);

      let written = 0;
      for (const targetPath of targetPaths) {
        const parts = targetPath.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
        let cur = rootHandle;
        for (const part of parts) cur = await getOrCreateDir(cur, part);
        const skillsDir = await getOrCreateDir(cur, 'chenzy-design-guide');
        for (const [path, content] of zipFiles) {
          const relPath = path.slice(ZIP_ROOT.length);
          await writeFile(skillsDir, relPath, content);
          written++;
        }
      }

      message = `已写入 ${written} 个文件`;
      messageType = 'success';
    } catch (err) {
      message = `添加失败：${err instanceof Error ? err.message : String(err)}`;
      messageType = 'error';
    } finally {
      loading = false;
    }
  }
</script>

<Card style="max-width: 560px;">
  <p style="margin: 0 0 12px; font-weight: 600;">添加到我的项目</p>
  <p style="margin: 0 0 16px; color: var(--cd-color-text-2);">选择要将 Skills 添加到的编程工具：</p>

  <CheckboxGroup
    value={selected}
    onChange={(v) => {
      selected = v;
      message = null;
    }}
  >
    <div style="display: flex; flex-direction: column; gap: 12px;">
      {#each clientOptions as option (option.id)}
        <Checkbox value={option.id}>
          <span style="font-weight: 600;">{option.label}</span>
          <span style="color: var(--cd-color-text-3); font-size: 12px; margin-left: 6px;">({option.path})</span>
          <div style="color: var(--cd-color-text-2); font-size: 12px; margin-top: 2px;">{option.desc}</div>
        </Checkbox>
      {/each}
    </div>
  </CheckboxGroup>

  {#if message}
    <p style="margin: 12px 0 0; color: {messageType === 'error' ? 'var(--cd-color-danger)' : 'var(--cd-color-success)'};">
      {message}
    </p>
  {/if}

  <div style="margin-top: 16px; display: flex; align-items: center; gap: 12px;">
    <Button type="primary" {loading} disabled={selected.length === 0} onclick={addToProject}>添加到我的项目</Button>
    {#if !loading}
      <span style="font-size: 12px; color: var(--cd-color-text-3);">需授权访问本地目录，仅写入不读取其他文件</span>
    {/if}
  </div>

  {#if !supported}
    <p style="margin: 12px 0 0; font-size: 12px; color: var(--cd-color-text-3);">
      当前浏览器不支持一键写入（需 Chrome / Edge 等 Chromium 内核浏览器），可改用下方
      <a href="{base}/chenzy-design-skills.zip" download>下载 zip</a> 手动解压。
    </p>
  {/if}
</Card>
