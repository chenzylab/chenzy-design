/**
 * Upload constants — ported from Semi semi-foundation/upload/constants.ts.
 * See specs/components/input/Upload.spec.md §3.
 */

export const FILE_STATUS_UPLOADING = 'uploading';
export const FILE_STATUS_SUCCESS = 'success';
export const FILE_STATUS_UPLOAD_FAIL = 'uploadFail';
export const FILE_STATUS_VALIDATING = 'validating';
export const FILE_STATUS_VALID_FAIL = 'validateFail';
export const FILE_STATUS_WAIT_UPLOAD = 'wait';

export const FILE_LIST_PIC = 'picture';
export const FILE_LIST_DEFAULT = 'list';
export const FILE_LIST_NONE = 'none';
export const LIST_TYPE = [FILE_LIST_PIC, FILE_LIST_DEFAULT, FILE_LIST_NONE] as const;

export const DRAG_AREA_DEFAULT = 'default';
export const DRAG_AREA_LEGAL = 'legal';
export const DRAG_AREA_ILLEGAL = 'illegal';

export const TRIGGER_AUTO = 'auto';
export const TRIGGER_CUSTOM = 'custom';
export const UPLOAD_TRIGGER = [TRIGGER_AUTO, TRIGGER_CUSTOM] as const;

export const PROMPT_POSITION = ['left', 'right', 'bottom'] as const;

/** Semi PROGRESS_COEFFICIENT: XHR progress percent is scaled by 0.95, final 100% only on success. */
export const PROGRESS_COEFFICIENT = 0.95;

export const byteKB = 1024;
export const byteMB = 1048576;
