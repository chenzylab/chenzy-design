/**
 * get_chenzy_document — 获取组件文档 / 组件列表 / changelog 分页。
 * 对齐 semi-mcp get_semi_document：大文档（>888 行）代码块替换为占位符，
 * 配套 get_chenzy_code_block 按索引取回。
 */
import type { Tool, CallToolResult } from '@modelcontextprotocol/server';
import { fetchFileContent } from '../utils/fetch.js';
import {
  SVELTE_PACKAGE,
  getComponentsManifest,
  resolveComponent,
  renderComponentList,
} from '../utils/components-json.js';

const CODE_BLOCK_REGEX = /```[\s\S]*?```/g;
/** 文档行数阈值，超过此值替换代码块为占位符 */
const LARGE_DOCUMENT_THRESHOLD = 888;
/** changelog 每页行数 */
const CHANGELOG_PAGE_SIZE = 300;

export function extractCodeBlocks(content: string): string[] {
  return content.match(CODE_BLOCK_REGEX) ?? [];
}

export function replaceCodeBlocksWithPlaceholders(
  content: string,
  componentName: string,
): string {
  let index = 0;
  return content.replace(CODE_BLOCK_REGEX, () => {
    index++;
    return `\`\`\`text\n[代码块 #${index} 已隐藏]\n要查看此代码，请使用 get_chenzy_code_block 工具，传入参数:\n- componentName: "${componentName}"\n- codeBlockIndex: ${index}\n\`\`\``;
  });
}

/** 取组件文档 markdown（dist/content/components/<docName>.md）。 */
export async function getComponentDocument(
  componentName: string,
  version: string,
): Promise<{
  docName: string;
  metaName: string;
  content: string;
  viaSubComponent?: string;
} | null> {
  const manifest = await getComponentsManifest(version);
  const resolved = resolveComponent(manifest, componentName);
  if (!resolved) return null;
  const content = await fetchFileContent(
    SVELTE_PACKAGE,
    version,
    `dist/content/components/${resolved.docName}.md`,
  );
  return {
    docName: resolved.docName,
    metaName: resolved.metaName,
    content,
    ...(resolved.viaSubComponent
      ? { viaSubComponent: resolved.viaSubComponent }
      : {}),
  };
}

export const getChenzyDocumentTool: Tool = {
  name: 'get_chenzy_document',
  description:
    '获取 chenzy-design（Svelte 5 组件库）的组件文档或组件列表。不传 componentName 返回全部组件列表（名称/分类/简介）。传组件名（如 Button、button、ButtonGroup、date-picker）返回该组件完整 markdown 文档（含内联 demo 源码）。大文档的代码块会被替换为占位符，用 get_chenzy_code_block 按索引获取。changelog 需分页获取：传 changelog-1（第1页，最新）、changelog-2 等。仅查 API 表时推荐用更省 token 的 get_component_api。',
  inputSchema: {
    type: 'object',
    properties: {
      componentName: {
        type: 'string',
        description:
          '组件名（大小写/连字符不敏感）或 changelog-N。不传则返回组件列表',
      },
      version: {
        type: 'string',
        description: '@chenzy-design/svelte 版本号，默认 latest',
      },
    },
    required: [],
  },
};

function paginate(
  content: string,
  page: number,
): { content: string; totalPages: number } {
  const lines = content.split('\n');
  const totalPages = Math.ceil(lines.length / CHANGELOG_PAGE_SIZE);
  const start = (page - 1) * CHANGELOG_PAGE_SIZE;
  return {
    content: lines.slice(start, start + CHANGELOG_PAGE_SIZE).join('\n'),
    totalPages,
  };
}

export async function handleGetChenzyDocument(
  args: Record<string, unknown>,
): Promise<CallToolResult> {
  const componentName = args?.componentName as string | undefined;
  const version = (args?.version as string | undefined) || 'latest';

  try {
    if (!componentName) {
      const manifest = await getComponentsManifest(version);
      return {
        content: [{ type: 'text', text: renderComponentList(manifest) }],
      };
    }

    // changelog 分页
    const changelogMatch = componentName.match(/^changelog(?:-(\d+))?$/);
    if (changelogMatch) {
      if (!changelogMatch[1]) {
        return {
          content: [
            {
              type: 'text',
              text: 'changelog 文档较大，需分页获取：changelog-1（第1页，最新）、changelog-2 …',
            },
          ],
        };
      }
      const page = parseInt(changelogMatch[1], 10);
      const raw = await fetchFileContent(
        SVELTE_PACKAGE,
        version,
        'CHANGELOG.md',
      );
      const { content, totalPages } = paginate(raw, page);
      if (page < 1 || page > totalPages) {
        return {
          content: [
            {
              type: 'text',
              text: `页码 ${page} 超出范围，changelog 共 ${totalPages} 页（changelog-1 到 changelog-${totalPages}）`,
            },
          ],
          isError: true,
        };
      }
      const hints = [
        page < totalPages ? `changelog-${page + 1} 下一页` : '',
        page > 1 ? `changelog-${page - 1} 上一页` : '',
      ]
        .filter(Boolean)
        .join('，');
      return {
        content: [
          {
            type: 'text',
            text: `===== CHANGELOG (第 ${page}/${totalPages} 页) =====${hints ? `\n[提示: ${hints}]` : ''}\n\n${content}`,
          },
        ],
      };
    }

    const doc = await getComponentDocument(componentName, version);
    if (!doc) {
      const manifest = await getComponentsManifest(version);
      const names = Object.keys(manifest.components).join(', ');
      return {
        content: [
          {
            type: 'text',
            text: `未找到组件 "${componentName}"（版本 ${version}）。\n\n可用组件：${names}`,
          },
        ],
      };
    }

    const header: string[] = [`===== ${doc.metaName} =====`];
    if (doc.viaSubComponent) {
      header.push(
        `[提示: ${doc.viaSubComponent} 是 ${doc.metaName} 的子组件，以下为 ${doc.metaName} 的文档]`,
      );
    }
    if (/^generated:\s*true$/m.test(doc.content.slice(0, 300))) {
      header.push('[提示: 此文档由组件元数据自动生成，尚无人工撰写的完整文档]');
    }

    let body = doc.content;
    const lineCount = body.split('\n').length;
    if (lineCount > LARGE_DOCUMENT_THRESHOLD) {
      const blocks = extractCodeBlocks(body);
      body = replaceCodeBlocksWithPlaceholders(body, componentName);
      header.push(
        `[注意: 此文档原有 ${lineCount} 行，包含 ${blocks.length} 个代码块已被隐藏。使用 get_chenzy_code_block 工具查看具体代码]`,
      );
    }

    return {
      content: [{ type: 'text', text: `${header.join('\n')}\n\n${body}` }],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `获取文档失败: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
