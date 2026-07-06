/**
 * Aggregate every component `meta.ts` into a single machine-readable
 * `dist/components.json` (+ a `dist/components.d.ts` type declaration),
 * so IDE plugins / doc generators / AI tools have one entry point.
 *
 * See specs/00-foundation/ai-friendly.spec.md §2.
 *
 * Run via `pnpm --filter @chenzy-design/svelte build:meta`
 * (chained after `svelte-package` in the package `build` script).
 *
 * This script only reads the plain `as const` meta objects; it pulls in no
 * Svelte runtime, so it runs cleanly under `tsx`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { meta as buttonMeta } from '../src/button/meta.ts';
import { meta as iconButtonMeta } from '../src/iconbutton/meta.ts';
import { meta as floatButtonMeta } from '../src/float-button/meta.ts';
import { meta as iconMeta } from '../src/icon/meta.ts';
import { meta as dividerMeta } from '../src/divider/meta.ts';
import { meta as spaceMeta } from '../src/space/meta.ts';
import { meta as typographyMeta } from '../src/typography/meta.ts';
import { meta as gridMeta } from '../src/grid/meta.ts';
import { meta as layoutMeta } from '../src/layout/meta.ts';
import { meta as inputMeta } from '../src/input/meta.ts';
import { meta as textareaMeta } from '../src/textarea/meta.ts';
import { meta as switchMeta } from '../src/switch/meta.ts';
import { meta as checkboxMeta } from '../src/checkbox/meta.ts';
import { meta as radioMeta } from '../src/radio/meta.ts';
import { meta as inputNumberMeta } from '../src/input-number/meta.ts';
import { meta as ratingMeta } from '../src/rating/meta.ts';
import { meta as hotKeysMeta } from '../src/hotkeys/meta.ts';
import { meta as sliderMeta } from '../src/slider/meta.ts';
import { meta as formMeta } from '../src/form/meta.ts';
import { meta as selectMeta } from '../src/select/meta.ts';
import { meta as autocompleteMeta } from '../src/autocomplete/meta.ts';
import { meta as tagInputMeta } from '../src/tag-input/meta.ts';
import { meta as pinCodeMeta } from '../src/pincode/meta.ts';
import { meta as colorPickerMeta } from '../src/color-picker/meta.ts';
import { meta as datePickerMeta } from '../src/date-picker/meta.ts';
import { meta as rangePickerMeta } from '../src/date-picker/range-meta.ts';
import { meta as timePickerMeta } from '../src/time-picker/meta.ts';
import { meta as cascaderMeta } from '../src/cascader/meta.ts';
import { meta as treeSelectMeta } from '../src/tree-select/meta.ts';
import { meta as transferMeta } from '../src/transfer/meta.ts';
import { meta as uploadMeta } from '../src/upload/meta.ts';
import { meta as breadcrumbMeta } from '../src/breadcrumb/meta.ts';
import { meta as paginationMeta } from '../src/pagination/meta.ts';
import { meta as stepsMeta } from '../src/steps/meta.ts';
import { meta as tabsMeta } from '../src/tabs/meta.ts';
import { meta as dropdownMeta } from '../src/dropdown/meta.ts';
import { meta as menuMeta } from '../src/menu/meta.ts';
import { meta as navMeta } from '../src/nav/meta.ts';
import { meta as anchorMeta } from '../src/anchor/meta.ts';
import { meta as tagMeta } from '../src/tag/meta.ts';
import { meta as avatarMeta } from '../src/avatar/meta.ts';
import { meta as badgeMeta } from '../src/badge/meta.ts';
import { meta as cardMeta } from '../src/card/meta.ts';
import { meta as tooltipMeta } from '../src/tooltip/meta.ts';
import { meta as popoverMeta } from '../src/popover/meta.ts';
import { meta as emptyMeta } from '../src/empty/meta.ts';
import { meta as descriptionsMeta } from '../src/descriptions/meta.ts';
import { meta as collapseMeta } from '../src/collapse/meta.ts';
import { meta as timelineMeta } from '../src/timeline/meta.ts';
import { meta as listMeta } from '../src/list/meta.ts';
import { meta as imageMeta } from '../src/image/meta.ts';
import { meta as highlightMeta } from '../src/highlight/meta.ts';
import { meta as virtualListMeta } from '../src/virtual-list/meta.ts';
import { meta as carouselMeta } from '../src/carousel/meta.ts';
import { meta as treeMeta } from '../src/tree/meta.ts';
import { meta as tableMeta } from '../src/table/meta.ts';
import { meta as calendarMeta } from '../src/calendar/meta.ts';
import { meta as scrollListMeta } from '../src/scroll-list/meta.ts';
import { meta as overflowListMeta } from '../src/overflow-list/meta.ts';
import { meta as spinMeta } from '../src/spin/meta.ts';
import { meta as progressMeta } from '../src/progress/meta.ts';
import { meta as skeletonMeta } from '../src/skeleton/meta.ts';
import { meta as bannerMeta } from '../src/banner/meta.ts';
import { meta as modalMeta } from '../src/modal/meta.ts';
import { meta as popconfirmMeta } from '../src/popconfirm/meta.ts';
import { meta as drawerMeta } from '../src/drawer/meta.ts';
import { meta as sideSheetMeta } from '../src/side-sheet/meta.ts';
import { meta as toastMeta } from '../src/toast/meta.ts';
import { meta as notificationMeta } from '../src/notification/meta.ts';
import { meta as backTopMeta } from '../src/back-top/meta.ts';
import { meta as localeProviderMeta } from '../src/locale-provider/meta.ts';
import { meta as configProviderMeta } from '../src/config-provider/meta.ts';
import { meta as resizeObserverMeta } from '../src/resize-observer/meta.ts';
import { meta as lottieIconMeta } from '../src/lottie-icon/meta.ts';
// 富媒体 / AI 组件（M4+）——补齐生成器缺口，使其详情页 API 表有数据源。
import { meta as codeHighlightMeta } from '../src/code-highlight/meta.ts';
import { meta as markdownRenderMeta } from '../src/markdown-render/meta.ts';
import { meta as videoPlayerMeta } from '../src/video-player/meta.ts';
import { meta as audioPlayerMeta } from '../src/audio-player/meta.ts';
import { meta as jsonViewerMeta } from '../src/json-viewer/meta.ts';
import { meta as chatMeta } from '../src/chat/meta.ts';
import { meta as cropperMeta } from '../src/cropper/meta.ts';
import { meta as aiChatDialogueMeta } from '../src/ai-chat-dialogue/meta.ts';
import { meta as aiChatInputMeta } from '../src/ai-chat-input/meta.ts';
import { meta as userGuideMeta } from '../src/user-guide/meta.ts';
import { meta as resizableMeta } from '../src/resizable/meta.ts';
import { meta as dragMoveMeta } from '../src/drag-move/meta.ts';
import { meta as sideBarMeta } from '../src/sidebar/meta.ts';

/**
 * Full list of component metas. Mirrors the import set validated in
 * `src/meta.test.ts`, plus the standalone RangePicker meta. Each entry is a
 * plain `as const` object, so the aggregate is structurally faithful.
 */
const metas = [
  buttonMeta,
  iconButtonMeta,
  floatButtonMeta,
  userGuideMeta,
  resizableMeta,
  dragMoveMeta,
  iconMeta,
  dividerMeta,
  spaceMeta,
  typographyMeta,
  gridMeta,
  layoutMeta,
  inputMeta,
  textareaMeta,
  switchMeta,
  checkboxMeta,
  radioMeta,
  inputNumberMeta,
  ratingMeta,
  hotKeysMeta,
  sliderMeta,
  formMeta,
  selectMeta,
  autocompleteMeta,
  tagInputMeta,
  pinCodeMeta,
  colorPickerMeta,
  datePickerMeta,
  rangePickerMeta,
  timePickerMeta,
  cascaderMeta,
  treeSelectMeta,
  transferMeta,
  uploadMeta,
  breadcrumbMeta,
  paginationMeta,
  stepsMeta,
  tabsMeta,
  dropdownMeta,
  menuMeta,
  navMeta,
  anchorMeta,
  tagMeta,
  avatarMeta,
  badgeMeta,
  cardMeta,
  tooltipMeta,
  popoverMeta,
  emptyMeta,
  descriptionsMeta,
  collapseMeta,
  timelineMeta,
  listMeta,
  imageMeta,
  highlightMeta,
  virtualListMeta,
  carouselMeta,
  treeMeta,
  tableMeta,
  calendarMeta,
  scrollListMeta,
  overflowListMeta,
  spinMeta,
  progressMeta,
  skeletonMeta,
  bannerMeta,
  modalMeta,
  popconfirmMeta,
  drawerMeta,
  sideSheetMeta,
  toastMeta,
  notificationMeta,
  backTopMeta,
  localeProviderMeta,
  configProviderMeta,
  resizeObserverMeta,
  lottieIconMeta,
  // 富媒体 / AI 组件（M4+）
  codeHighlightMeta,
  markdownRenderMeta,
  videoPlayerMeta,
  audioPlayerMeta,
  jsonViewerMeta,
  chatMeta,
  cropperMeta,
  aiChatDialogueMeta,
  aiChatInputMeta,
  sideBarMeta,
] as const;

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(__dirname, '..');
const outDir = resolve(pkgRoot, 'dist');

/** Aggregate keyed by the component's display name (e.g. `Button`). */
const components: Record<string, unknown> = {};
for (const m of metas) {
  const name = (m as { name: string }).name;
  if (!name) throw new Error('Encountered a meta without a `name` field.');
  if (name in components) {
    throw new Error(`Duplicate component name in metas: ${name}`);
  }
  components[name] = m;
}

const manifest = {
  version: '1',
  generatedFrom: '@chenzy-design/svelte component meta.ts files',
  generatedAt: new Date().toISOString(),
  count: Object.keys(components).length,
  components,
};

mkdirSync(outDir, { recursive: true });

const jsonPath = resolve(outDir, 'components.json');
writeFileSync(jsonPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

/**
 * Emit a `.d.ts` so consumers get type-safe access. The literal component-name
 * union and token-key union are the parts AI/IDE tooling cares about most.
 */
const componentNames = Object.keys(components).sort();
const tokenKeys = Array.from(
  new Set(
    metas.flatMap((m) =>
      Array.isArray((m as { tokens?: unknown }).tokens)
        ? ((m as { tokens: string[] }).tokens)
        : [],
    ),
  ),
).sort();

const dtsLines: string[] = [
  '// Generated by scripts/build-components-json.ts. Do not edit by hand.',
  '',
  '/** Single prop entry in a component meta. */',
  'export interface ComponentPropMeta {',
  '  name: string;',
  '  type: string;',
  '  default?: string;',
  '  desc?: string;',
  '}',
  '',
  '/** Aggregated metadata for one component. Mirrors `src/<comp>/meta.ts`. */',
  'export interface ComponentMeta {',
  '  name: string;',
  "  category: 'basic' | 'input' | 'navigation' | 'show' | 'feedback' | 'other';",
  '  description: string;',
  '  props?: ComponentPropMeta[];',
  '  subComponents?: Array<{ name?: string; props?: ComponentPropMeta[]; [k: string]: unknown }>;',
  '  events?: Array<{ name: string; payload?: string; desc?: string }>;',
  '  slots?: Array<{ name: string; desc?: string }>;',
  '  a11y?: Record<string, unknown>;',
  '  tokens?: string[];',
  '  examples?: Array<{ title: string; code: string }>;',
  '  [k: string]: unknown;',
  '}',
  '',
  '/** Display names of every component in the manifest. */',
  `export type ComponentName =\n${componentNames.map((n) => `  | '${n}'`).join('\n')};`,
  '',
  '/** Design-token key prefixes referenced across all component metas. */',
  `export type TokenKey =\n${tokenKeys.map((t) => `  | '${t}'`).join('\n')};`,
  '',
  '/** Shape of the generated `components.json` manifest. */',
  'export interface ComponentsManifest {',
  '  version: string;',
  '  generatedFrom: string;',
  '  generatedAt: string;',
  '  count: number;',
  '  components: Record<ComponentName, ComponentMeta>;',
  '}',
  '',
  'declare const manifest: ComponentsManifest;',
  'export default manifest;',
  '',
];

const dtsPath = resolve(outDir, 'components.d.ts');
writeFileSync(dtsPath, dtsLines.join('\n'), 'utf8');

console.log(
  `[build:meta] wrote ${manifest.count} components -> ${jsonPath}\n` +
    `[build:meta] wrote types -> ${dtsPath}`,
);
