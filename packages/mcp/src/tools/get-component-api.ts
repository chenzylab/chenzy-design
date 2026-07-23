/**
 * get_component_api — 本库新增工具（semi-mcp 没有）：从 components.json manifest
 * 精准返回单组件 API，比读整篇文档省 token。
 */
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  getComponentsManifest,
  resolveComponent,
  type ComponentMeta,
  type MetaField,
} from '../utils/components-json.js';

const SECTIONS = ['all', 'props', 'events', 'slots', 'methods', 'tokens', 'a11y', 'examples'] as const;
type Section = (typeof SECTIONS)[number];

export const getComponentApiTool: Tool = {
  name: 'get_component_api',
  description:
    '从组件元数据精准返回 chenzy-design 单个组件的 API：props（名称/类型/默认值/说明）、events、slots、methods、design tokens、无障碍要点、最小示例。查 API 优先用此工具而非整篇文档，省 token。可用 section 参数只取一节。',
  inputSchema: {
    type: 'object',
    properties: {
      componentName: { type: 'string', description: '组件名，如 Button、Table、date-picker（大小写/连字符不敏感）' },
      section: {
        type: 'string',
        enum: [...SECTIONS],
        description: '只返回指定小节，默认 all',
      },
      version: { type: 'string', description: '版本号，默认 latest' },
    },
    required: ['componentName'],
  },
};

function fieldTable(rows: MetaField[], headers: [string, string, string, string]): string {
  const esc = (s?: string) => (s ?? '-').replace(/\|/g, '\\|').replace(/\n/g, ' ') || '-';
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((r) => `| ${esc(r.name)} | ${esc(r.desc)} | ${esc(r.type)} | ${esc(r.default)} |`),
  ].join('\n');
}

export function renderApi(meta: ComponentMeta, section: Section): string {
  const parts: string[] = [];
  const want = (s: Section) => section === 'all' || section === s;

  if (want('props') && meta.props?.length) {
    parts.push(`## Props`, fieldTable(meta.props, ['属性', '说明', '类型', '默认值']));
  }
  if (want('events') && meta.events?.length) {
    parts.push(`## Events`, fieldTable(meta.events, ['事件', '说明', '类型', '默认值']));
  }
  if (want('slots') && meta.slots?.length) {
    parts.push(`## Slots (snippets)`, fieldTable(meta.slots, ['插槽', '说明', '类型', '默认值']));
  }
  if (want('methods') && meta.methods?.length) {
    parts.push(
      `## Methods`,
      meta.methods.map((m) => `- \`${m.name}${m.signature ? `: ${m.signature}` : ''}\`${m.desc ? ` — ${m.desc}` : ''}`).join('\n'),
    );
  }
  if (want('tokens') && meta.tokens?.length) {
    parts.push(`## Design Tokens`, meta.tokens.map((t) => `- \`${t}\``).join('\n'));
  }
  if (want('a11y') && meta.a11y) {
    const lines =
      typeof meta.a11y === 'string'
        ? [meta.a11y]
        : Object.entries(meta.a11y)
            .filter(([, v]) => v != null && v !== false)
            .map(([k, v]) => (Array.isArray(v) ? `- ${k}: ${v.map(String).join('；')}` : v === true ? `- ${k}` : `- ${k}: ${String(v)}`));
    if (lines.length) parts.push(`## 无障碍`, lines.join('\n'));
  }
  if (want('examples') && meta.examples?.length) {
    const ex = meta.examples
      .map((e) => `${e.title ? `### ${e.title}\n` : ''}${e.code ? '```svelte\n' + e.code.trim() + '\n```' : ''}`)
      .join('\n\n');
    parts.push(`## 示例`, ex);
  }

  // subComponents 的 API 一并给出（all 模式；字符串形态只列名）
  if (section === 'all' && meta.subComponents?.length) {
    for (const sub of meta.subComponents) {
      if (typeof sub === 'string') {
        parts.push(`# 子组件 ${sub}`);
        continue;
      }
      parts.push(`# 子组件 ${sub.name}`);
      if (sub.props?.length) parts.push(fieldTable(sub.props, ['属性', '说明', '类型', '默认值']));
    }
  }

  return parts.length ? parts.join('\n\n') : `（该组件的 ${section} 小节无内容）`;
}

export async function handleGetComponentApi(args: Record<string, unknown>): Promise<CallToolResult> {
  const componentName = args?.componentName as string | undefined;
  const section = ((args?.section as string | undefined) || 'all') as Section;
  const version = (args?.version as string | undefined) || 'latest';

  if (!componentName) {
    return { content: [{ type: 'text', text: '错误: 必须提供 componentName 参数' }], isError: true };
  }
  if (!SECTIONS.includes(section)) {
    return { content: [{ type: 'text', text: `错误: section 必须是 ${SECTIONS.join('/')} 之一` }], isError: true };
  }

  try {
    const manifest = await getComponentsManifest(version);
    const resolved = resolveComponent(manifest, componentName);
    if (!resolved) {
      return {
        content: [
          {
            type: 'text',
            text: `未找到组件 "${componentName}"（版本 ${version}）。可用组件：${Object.keys(manifest.components).join(', ')}`,
          },
        ],
        isError: true,
      };
    }

    // 传的是子组件名 → 直接给该子组件的 API 更精准（字符串形态的 sub 无独立 API，落回主组件）
    if (resolved.viaSubComponent) {
      const sub = resolved.meta.subComponents?.find(
        (s): s is Exclude<typeof s, string> => typeof s !== 'string' && s.name === resolved.viaSubComponent,
      );
      if (sub) {
        const body = renderApi({ ...sub, name: sub.name }, section);
        return {
          content: [
            {
              type: 'text',
              text: `# ${sub.name}（${resolved.metaName} 的子组件，版本 ${manifest.version}）\n\n${body}`,
            },
          ],
        };
      }
    }

    const body = renderApi(resolved.meta, section);
    return {
      content: [
        { type: 'text', text: `# ${resolved.metaName}（版本 ${manifest.version}）\n\n${resolved.meta.description ?? ''}\n\n${body}` },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `获取组件 API 失败: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}
