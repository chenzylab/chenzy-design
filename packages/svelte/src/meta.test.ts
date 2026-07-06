import { describe, expect, it } from 'vitest';
import { meta as buttonMeta } from './button/meta.js';
import { meta as iconButtonMeta } from './iconbutton/meta.js';
import { meta as floatButtonMeta } from './float-button/meta.js';
import { meta as iconMeta } from './icon/meta.js';
import { meta as dividerMeta } from './divider/meta.js';
import { meta as spaceMeta } from './space/meta.js';
import { meta as typographyMeta } from './typography/meta.js';
import { meta as gridMeta } from './grid/meta.js';
import { meta as layoutMeta } from './layout/meta.js';
import { meta as inputMeta } from './input/meta.js';
import { meta as textareaMeta } from './textarea/meta.js';
import { meta as switchMeta } from './switch/meta.js';
import { meta as checkboxMeta } from './checkbox/meta.js';
import { meta as radioMeta } from './radio/meta.js';
import { meta as inputNumberMeta } from './input-number/meta.js';
import { meta as ratingMeta } from './rating/meta.js';
import { meta as pinCodeMeta } from './pincode/meta.js';
import { meta as hotKeysMeta } from './hotkeys/meta.js';
import { meta as userGuideMeta } from './user-guide/meta.js';
import { meta as resizableMeta } from './resizable/meta.js';
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
import { meta as menuMeta } from './menu/meta.js';
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
import { meta as drawerMeta } from './drawer/meta.js';
import { meta as sideSheetMeta } from './side-sheet/meta.js';
import { meta as toastMeta } from './toast/meta.js';
import { meta as notificationMeta } from './notification/meta.js';
import { meta as backTopMeta } from './back-top/meta.js';
import { meta as localeProviderMeta } from './locale-provider/meta.js';
import { meta as configProviderMeta } from './config-provider/meta.js';
import { meta as resizeObserverMeta } from './resize-observer/meta.js';
import { meta as lottieIconMeta } from './lottie-icon/meta.js';
import { meta as markdownRenderMeta } from './markdown-render/meta.js';
import { meta as videoPlayerMeta } from './video-player/meta.js';
import { meta as jsonViewerMeta } from './json-viewer/meta.js';
import { meta as chatMeta } from './chat/meta.js';
import { meta as aiChatDialogueMeta } from './ai-chat-dialogue/meta.js';
import { meta as aiChatInputMeta } from './ai-chat-input/meta.js';
import { meta as sideBarMeta } from './sidebar/meta.js';

const metas = {
  buttonMeta,
  iconButtonMeta,
  floatButtonMeta,
  resizableMeta,
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
  menuMeta,
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
  drawerMeta,
  sideSheetMeta,
  toastMeta,
  notificationMeta,
  backTopMeta,
  localeProviderMeta,
  configProviderMeta,
  resizeObserverMeta,
  lottieIconMeta,
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
    expect(['basic', 'input', 'navigation', 'show', 'feedback', 'other']).toContain(
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
