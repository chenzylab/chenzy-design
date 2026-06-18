import { describe, expect, it } from 'vitest';
import { meta as buttonMeta } from './button/meta.js';
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

const metas = {
  buttonMeta,
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
