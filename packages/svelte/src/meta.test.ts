import { describe, expect, it } from 'vitest';
import { meta as buttonMeta } from './button/meta.js';
// IconButton / CardGroup 严格对齐 Semi 后不再是独立组件 meta（无 category），是父组件子项，
// 不纳入要求 category 的顶层组件断言（其 props 完整性经父 meta 的 subComponents 覆盖）。
import { meta as floatButtonMeta } from './float-button/meta.js';
import { meta as iconMeta } from './icon/meta.js';
import { meta as dividerMeta } from './divider/meta.js';
import { meta as spaceMeta } from './space/meta.js';
import { meta as typographyMeta } from './typography/meta.js';
import { meta as gridMeta } from './grid/meta.js';
import { meta as layoutMeta } from './layout/meta.js';
// InputGroup / TextArea 严格对齐 Semi 后不再是独立组件 meta（无 category），
// 而是 Input.subComponents；其 props 完整性经 Input meta 的 subComponents 覆盖，
// 不纳入要求 category 的顶层组件断言。
import { meta as inputMeta } from './input/meta.js';
import { meta as switchMeta } from './switch/meta.js';
import { meta as checkboxMeta } from './checkbox/meta.js';
import { meta as radioMeta } from './radio/meta.js';
import { meta as inputNumberMeta } from './input-number/meta.js';
import { meta as ratingMeta } from './rating/meta.js';
import { meta as pinCodeMeta } from './pincode/meta.js';
import { meta as hotKeysMeta } from './hotkeys/meta.js';
import { meta as userGuideMeta } from './user-guide/meta.js';
import { meta as resizableMeta } from './resizable/meta.js';
import { meta as dragMoveMeta } from './drag-move/meta.js';
import { meta as sliderMeta } from './slider/meta.js';
import { meta as formMeta } from './form/meta.js';
import { meta as selectMeta } from './select/meta.js';
import { meta as autocompleteMeta } from './autocomplete/meta.js';
import { meta as tagInputMeta } from './tag-input/meta.js';
import { meta as colorPickerMeta } from './color-picker/meta.js';
import { meta as datePickerMeta } from './date-picker/meta.js';
import { meta as timePickerMeta } from './time-picker/meta.js';
import { meta as cascaderMeta } from './cascader/meta.js';
import { meta as treeSelectMeta } from './tree-select/meta.js';
import { meta as transferMeta } from './transfer/meta.js';
import { meta as uploadMeta } from './upload/meta.js';
import { meta as breadcrumbMeta } from './breadcrumb/meta.js';
import { meta as paginationMeta } from './pagination/meta.js';
import { meta as stepsMeta } from './steps/meta.js';
import { meta as tabsMeta } from './tabs/meta.js';
import { meta as dropdownMeta } from './dropdown/meta.js';
import { meta as anchorMeta } from './anchor/meta.js';
import { meta as tagMeta } from './tag/meta.js';
import { meta as avatarMeta } from './avatar/meta.js';
import { meta as badgeMeta } from './badge/meta.js';
import { meta as cardMeta } from './card/meta.js';
import { meta as tooltipMeta } from './tooltip/meta.js';
import { meta as popoverMeta } from './popover/meta.js';
import { meta as emptyMeta } from './empty/meta.js';
import { meta as descriptionsMeta } from './descriptions/meta.js';
import { meta as collapseMeta } from './collapse/meta.js';
import { meta as collapsibleMeta } from './collapsible/meta.js';
import { meta as timelineMeta } from './timeline/meta.js';
import { meta as listMeta } from './list/meta.js';
import { meta as imageMeta } from './image/meta.js';
import { meta as cropperMeta } from './cropper/meta.js';
import { meta as highlightMeta } from './highlight/meta.js';
import { meta as codeHighlightMeta } from './code-highlight/meta.js';
import { meta as virtualListMeta } from './virtual-list/meta.js';
import { meta as carouselMeta } from './carousel/meta.js';
import { meta as treeMeta } from './tree/meta.js';
import { meta as tableMeta } from './table/meta.js';
import { meta as calendarMeta } from './calendar/meta.js';
import { meta as scrollListMeta } from './scroll-list/meta.js';
import { meta as overflowListMeta } from './overflow-list/meta.js';
import { meta as audioPlayerMeta } from './audio-player/meta.js';
import { meta as spinMeta } from './spin/meta.js';
import { meta as progressMeta } from './progress/meta.js';
import { meta as skeletonMeta } from './skeleton/meta.js';
import { meta as bannerMeta } from './banner/meta.js';
import { meta as modalMeta } from './modal/meta.js';
import { meta as popconfirmMeta } from './popconfirm/meta.js';
import { meta as sideSheetMeta } from './side-sheet/meta.js';
import { meta as feedbackMeta } from './feedback/meta.js';
import { meta as toastMeta } from './toast/meta.js';
import { meta as notificationMeta } from './notification/meta.js';
import { meta as backTopMeta } from './back-top/meta.js';
import { meta as localeProviderMeta } from './locale-provider/meta.js';
import { meta as configProviderMeta } from './config-provider/meta.js';
import { meta as resizeObserverMeta } from './resize-observer/meta.js';
import { meta as lottieMeta } from './lottie/meta.js';
import { meta as markdownRenderMeta } from './markdown-render/meta.js';
import { meta as videoPlayerMeta } from './video-player/meta.js';
import { meta as jsonViewerMeta } from './json-viewer/meta.js';
import { meta as chatMeta } from './chat/meta.js';
import { meta as aiChatDialogueMeta } from './ai-chat-dialogue/meta.js';
import { meta as aiChatInputMeta } from './ai-chat-input/meta.js';
import { meta as sideBarMeta } from './sidebar/meta.js';

const metas = {
  buttonMeta,
  floatButtonMeta,
  resizableMeta,
  dragMoveMeta,
  iconMeta,
  dividerMeta,
  spaceMeta,
  typographyMeta,
  gridMeta,
  layoutMeta,
  inputMeta,
  switchMeta,
  checkboxMeta,
  radioMeta,
  inputNumberMeta,
  ratingMeta,
  pinCodeMeta,
  hotKeysMeta,
  userGuideMeta,
  sliderMeta,
  formMeta,
  selectMeta,
  autocompleteMeta,
  tagInputMeta,
  colorPickerMeta,
  datePickerMeta,
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
  collapsibleMeta,
  timelineMeta,
  listMeta,
  imageMeta,
  cropperMeta,
  highlightMeta,
  codeHighlightMeta,
  virtualListMeta,
  carouselMeta,
  treeMeta,
  tableMeta,
  calendarMeta,
  scrollListMeta,
  overflowListMeta,
  audioPlayerMeta,
  spinMeta,
  progressMeta,
  skeletonMeta,
  bannerMeta,
  modalMeta,
  popconfirmMeta,
  sideSheetMeta,
  feedbackMeta,
  toastMeta,
  notificationMeta,
  backTopMeta,
  localeProviderMeta,
  configProviderMeta,
  resizeObserverMeta,
  lottieMeta,
  markdownRenderMeta,
  videoPlayerMeta,
  jsonViewerMeta,
  chatMeta,
  aiChatDialogueMeta,
  aiChatInputMeta,
  sideBarMeta,
};

type PropEntry = { name?: string; type?: string };

/** collect prop entries from either a flat `props` or aggregated `subComponents[].props` */
function allProps(m: Record<string, unknown>): PropEntry[] {
  if (Array.isArray(m.props)) return m.props as PropEntry[];
  if (Array.isArray(m.subComponents)) {
    return (m.subComponents as Array<{ props?: PropEntry[] }>).flatMap(
      (sc) => sc.props ?? [],
    );
  }
  return [];
}

describe('component metadata', () => {
  it.each(Object.entries(metas))('%s is well-formed', (_name, m) => {
    expect(m.name).toBeTruthy();
    expect(['ai', 'basic', 'plus', 'input', 'navigation', 'show', 'feedback', 'other']).toContain(
      m.category,
    );
    expect(m.description).toBeTruthy();
    expect(allProps(m).length).toBeGreaterThan(0);
  });

  it('every prop entry has name and type', () => {
    for (const m of Object.values(metas)) {
      for (const p of allProps(m)) {
        expect(p.name, `${m.name} prop`).toBeTruthy();
        expect(p.type, `${m.name}.${p.name} type`).toBeTruthy();
      }
    }
  });
});
