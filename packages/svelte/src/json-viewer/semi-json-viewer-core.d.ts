/**
 * 内核包 `@douyinfe/semi-json-viewer-core` 只发布了编译后的 `lib/*`，其 `typings`
 * 字段指向未随包发布的 `src/index.ts`，故类型不可解析。此处补一份贴合 lib 运行时
 * API 的最小环境声明（依据 lib/index.js 与 Semi jsonViewer.foundation.d.ts 坐实）。
 * 仅声明本组件实际消费的成员，未列的成员不代表内核没有。
 */
declare module '@douyinfe/semi-json-viewer-core' {
  /** 内核事件总线（自研 emitter）。 */
  export interface JsonViewerEmitter {
    on(event: 'customRender', handler: (e: { customRenderMap: Map<HTMLElement, unknown> }) => void): void;
    on(event: 'contentChanged', handler: (e?: unknown) => void): void;
    on(event: string, handler: (e?: unknown) => void): void;
    off?(event: string, handler: (e?: unknown) => void): void;
  }

  /** JSON 模型（取值等）。 */
  export interface JsonModel {
    getValue(): string;
  }

  /** 搜索命中项。 */
  export interface FindMatch {
    range: {
      startLineNumber: number;
      startColumn: number;
      endLineNumber: number;
      endColumn: number;
    };
  }

  /** 搜索控件（内核仅提供检索/替换/导航 API，不渲染任何 UI）。 */
  export interface SearchWidget {
    searchResults: FindMatch[] | null;
    search(
      searchText: string,
      caseSensitive?: boolean,
      wholeWord?: boolean,
      regex?: boolean,
    ): void;
    navigateResults(direction: number): void;
    replace(replaceText: string): void;
    replaceAll(replaceText: string): void;
  }

  /** 格式化配置。 */
  export interface JsonFormatOptions {
    tabSize?: number;
    insertSpaces?: boolean;
    eol?: string;
  }

  /** 自定义渲染规则（仅只读模式生效）。 */
  export interface CustomRenderRule {
    match: (value: string, path?: string) => boolean;
    render: (value: string) => HTMLElement;
  }

  export type TokenRenderType = 'key' | 'value';

  /** 编辑器配置。 */
  export interface JsonViewerOptions {
    /** class 前缀，本库传 'cd-json-viewer'。 */
    prefixCls?: string;
    /** 行高 px（默认 20）。 */
    lineHeight?: number;
    /** 自动换行（默认 true）。 */
    autoWrap?: boolean;
    /** 只读（默认 false）。 */
    readOnly?: boolean;
    /** 自定义渲染规则（仅 readOnly 生效）。 */
    customRenderRule?: CustomRenderRule[];
    /** 格式化配置。 */
    formatOptions?: JsonFormatOptions;
    [key: string]: unknown;
  }

  /**
   * JSON 编辑器内核。`new JsonViewer(container, value, options)` 后调用 `layout()` 挂载。
   */
  export class JsonViewer {
    constructor(container: HTMLElement, value: string, options?: JsonViewerOptions);
    readonly emitter: JsonViewerEmitter;
    /** 挂载 / 重新布局。 */
    layout(): void;
    /** 取模型（getValue 等）。 */
    getModel(): JsonModel;
    /** 取搜索控件。 */
    getSearchWidget(): SearchWidget;
    /** 格式化当前内容。 */
    format(): void;
    /** 销毁实例、释放资源。 */
    dispose(): void;
  }
}
