import { describe, expect, it, vi } from 'vitest';
import {
  createUpload,
  type UploadAdapter,
  type UploadFoundationProps,
  type UploadFoundationState,
  type BaseFileItem,
  type CustomFile,
} from './foundation.js';

/**
 * 内存 harness：state 用一个可变对象，setState 浅合并；adapter 全部方法均为 vi.fn，
 * 默认 post 立即成功（同步调 onSuccess），createObjectUrl 返回可预测占位串。
 * 与 cropper.test.ts 同构（本仓库 headless foundation 测试范式）。
 */
function makeHarness(props: Partial<UploadFoundationProps> = {}, initialFileList: BaseFileItem[] = []) {
  const state: UploadFoundationState = { fileList: initialFileList, replaceIdx: -1 };
  const fullProps: UploadFoundationProps = {
    disabled: false,
    directory: false,
    uploadTrigger: 'auto',
    addOnPasting: false,
    ...props,
  };
  const objectUrls = new Map<string, string>();
  const adapter: UploadAdapter = {
    notifyFileSelect: vi.fn(),
    notifyError: vi.fn(),
    notifySuccess: vi.fn(),
    notifyProgress: vi.fn(),
    notifyRemove: vi.fn(),
    notifySizeError: vi.fn(),
    notifyExceed: vi.fn(),
    notifyBeforeUpload: vi.fn(() => true),
    notifyAfterUpload: vi.fn(),
    notifyBeforeRemove: vi.fn(() => true),
    notifyBeforeClear: vi.fn(() => true),
    notifyChange: vi.fn(),
    notifyClear: vi.fn(),
    notifyPreviewClick: vi.fn(),
    notifyDrop: vi.fn(),
    notifyAcceptInvalid: vi.fn(),
    notifyPastingError: vi.fn(),
    notifyRetry: vi.fn(),
    createObjectUrl: vi.fn((file: File, uid: string) => {
      const u = `blob:${uid}`;
      objectUrls.set(uid, u);
      return u;
    }),
    releaseObjectUrl: vi.fn((uid: string) => objectUrls.delete(uid)),
    releaseAllObjectUrls: vi.fn(() => objectUrls.clear()),
    post: vi.fn((file, hooks) => {
      // default: succeed immediately with an empty body
      hooks.onSuccess(undefined);
    }),
  };
  const foundation = createUpload({
    adapter,
    getProps: () => fullProps,
    getState: () => state,
    setState: (patch) => Object.assign(state, patch),
  });
  return { foundation, state, adapter, objectUrls };
}

function makeFile(name: string, size: number, type = 'text/plain'): CustomFile {
  const file = new File(['x'.repeat(Math.max(1, size))], name, { type }) as CustomFile;
  // jsdom File size derives from content length; override to test exact bytes precisely.
  Object.defineProperty(file, 'size', { value: size, configurable: true });
  return file;
}

describe('createUpload — handleChange (selection pipeline)', () => {
  it('builds a wait-state file item and auto-uploads it (uploadTrigger=auto)', () => {
    const { foundation, state, adapter } = makeHarness({ uploadTrigger: 'auto' });
    foundation.handleChange([makeFile('a.txt', 100)]);

    expect(state.fileList).toHaveLength(1);
    expect(state.fileList[0]!.name).toBe('a.txt');
    expect(state.fileList[0]!.size).toBe('0.10KB');
    expect(adapter.notifyFileSelect).toHaveBeenCalledTimes(1);
    // auto trigger + default post (succeeds sync) → status ends success
    expect(state.fileList[0]!.status).toBe('success');
    expect(adapter.notifyChange).toHaveBeenCalled();
  });

  it('marks files "wait" (not uploading) under uploadTrigger=custom, no post', () => {
    const { foundation, state, adapter } = makeHarness({ uploadTrigger: 'custom' });
    foundation.handleChange([makeFile('a.txt', 100)]);
    expect(state.fileList[0]!.status).toBe('wait');
    expect(adapter.post).not.toHaveBeenCalled();
  });

  it('filters files by accept, notifying rejected ones', () => {
    const { foundation, state, adapter } = makeHarness({ accept: '.pdf', uploadTrigger: 'custom' });
    foundation.handleChange([makeFile('a.pdf', 100, 'application/pdf'), makeFile('b.txt', 100)]);
    expect(state.fileList).toHaveLength(1);
    expect(state.fileList[0]!.name).toBe('a.pdf');
    expect(adapter.notifyAcceptInvalid).toHaveBeenCalledTimes(1);
  });

  it('flags oversized files validateFail and reports notifySizeError', () => {
    const { foundation, state, adapter } = makeHarness({ maxSize: 1, uploadTrigger: 'custom' }); // 1KB max
    foundation.handleChange([makeFile('big.bin', 2048)]);
    expect(state.fileList[0]!.status).toBe('validateFail');
    expect(adapter.notifySizeError).toHaveBeenCalledTimes(1);
  });

  it('does NOT auto-upload an oversized file even when uploadTrigger=auto (regression: _sizeInvalid must survive buildFileItem)', () => {
    const { foundation, state, adapter } = makeHarness({ maxSize: 1, uploadTrigger: 'auto' }); // 1KB max
    foundation.handleChange([makeFile('big.bin', 2048)]);
    expect(state.fileList[0]!.status).toBe('validateFail');
    expect(state.fileList[0]!._sizeInvalid).toBe(true);
    expect(adapter.post).not.toHaveBeenCalled();
  });

  it('enforces limit: extra files trigger notifyExceed and are dropped', () => {
    const { foundation, state, adapter } = makeHarness({ limit: 1, uploadTrigger: 'custom' });
    foundation.handleChange([makeFile('a.txt', 10), makeFile('b.txt', 10)]);
    expect(state.fileList).toHaveLength(1);
    expect(adapter.notifyExceed).toHaveBeenCalledTimes(1);
  });

  it('limit=1 replaces the whole list with the last selected file', () => {
    const { foundation, state } = makeHarness(
      { limit: 1, uploadTrigger: 'custom' },
      [{ status: 'success', name: 'old.txt', size: '1.0KB', uid: 'old' }],
    );
    foundation.handleChange([makeFile('new.txt', 10)]);
    expect(state.fileList).toHaveLength(1);
    expect(state.fileList[0]!.name).toBe('new.txt');
  });

  it('marks isImageFile files with preview:true', () => {
    const { foundation, state } = makeHarness({ uploadTrigger: 'custom' });
    foundation.handleChange([makeFile('a.png', 10, 'image/png')]);
    expect(state.fileList[0]!.preview).toBe(true);
  });

  it('runs transformFile before uid assignment / size check', () => {
    const transformed = makeFile('renamed.txt', 5);
    const { foundation, state } = makeHarness({
      uploadTrigger: 'custom',
      transformFile: () => transformed,
    });
    foundation.handleChange([makeFile('a.txt', 100)]);
    expect(state.fileList[0]!.name).toBe('renamed.txt');
  });
});

describe('createUpload — beforeUpload result parsing', () => {
  it('true → uploads normally', () => {
    const { foundation, state, adapter } = makeHarness({
      uploadTrigger: 'auto',
      beforeUpload: true,
    });
    (adapter.notifyBeforeUpload as ReturnType<typeof vi.fn>).mockReturnValue(true);
    foundation.handleChange([makeFile('a.txt', 10)]);
    expect(state.fileList[0]!.status).toBe('success');
  });

  it('false → marks validateFail, does not post', () => {
    const { foundation, state, adapter } = makeHarness({ uploadTrigger: 'auto', beforeUpload: true });
    (adapter.notifyBeforeUpload as ReturnType<typeof vi.fn>).mockReturnValue(false);
    foundation.handleChange([makeFile('a.txt', 10)]);
    expect(state.fileList[0]!.status).toBe('validateFail');
    expect(adapter.post).not.toHaveBeenCalled();
  });

  it('object result with autoRemove:true removes the item, skips post', () => {
    const { foundation, state, adapter } = makeHarness({ uploadTrigger: 'auto', beforeUpload: true });
    (adapter.notifyBeforeUpload as ReturnType<typeof vi.fn>).mockReturnValue({ autoRemove: true });
    foundation.handleChange([makeFile('a.txt', 10)]);
    expect(state.fileList).toHaveLength(0);
    expect(adapter.post).not.toHaveBeenCalled();
  });

  it('object result with shouldUpload:true posts and can override status/fileInstance', () => {
    const replacement = makeFile('replaced.txt', 20);
    const { foundation, state, adapter } = makeHarness({ uploadTrigger: 'auto', beforeUpload: true });
    (adapter.notifyBeforeUpload as ReturnType<typeof vi.fn>).mockReturnValue({
      shouldUpload: true,
      fileInstance: replacement,
    });
    foundation.handleChange([makeFile('a.txt', 10)]);
    expect(state.fileList[0]!.name).toBe('replaced.txt');
    expect(adapter.post).toHaveBeenCalledTimes(1);
  });

  it('async (Promise) result resolves and applies afterward', async () => {
    const { foundation, state, adapter } = makeHarness({ uploadTrigger: 'auto', beforeUpload: true });
    (adapter.notifyBeforeUpload as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve(true));
    foundation.handleChange([makeFile('a.txt', 10)]);
    // still pending synchronously
    await Promise.resolve();
    await Promise.resolve();
    expect(state.fileList[0]!.status).toBe('success');
  });

  it('rejected Promise → validateFail', async () => {
    const { foundation, state, adapter } = makeHarness({ uploadTrigger: 'auto', beforeUpload: true });
    (adapter.notifyBeforeUpload as ReturnType<typeof vi.fn>).mockReturnValue(Promise.reject(new Error('nope')));
    foundation.handleChange([makeFile('a.txt', 10)]);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(state.fileList[0]!.status).toBe('validateFail');
  });
});

describe('createUpload — progress / success / error', () => {
  it('handleProgress scales by PROGRESS_COEFFICIENT and updates percent+status', () => {
    const item: BaseFileItem = { status: 'uploading', name: 'a.txt', size: '1.0KB', uid: 'u1' };
    const { foundation, state } = makeHarness({}, [item]);
    foundation.handleProgress({ loaded: 50, total: 100 }, item);
    expect(state.fileList[0]!.percent).toBe(48); // round(50 * 0.95)
    expect(state.fileList[0]!.status).toBe('uploading');
  });

  it('handleSuccess sets status success, percent 100, stores response', () => {
    const item: BaseFileItem = { status: 'uploading', name: 'a.txt', size: '1.0KB', uid: 'u1' };
    const { foundation, state, adapter } = makeHarness({}, [item]);
    foundation.handleSuccess(item, { ok: true });
    expect(state.fileList[0]!.status).toBe('success');
    expect(state.fileList[0]!.percent).toBe(100);
    expect(state.fileList[0]!.response).toEqual({ ok: true });
    expect(adapter.notifySuccess).toHaveBeenCalledTimes(1);
  });

  it('handleError sets status uploadFail and forwards xhr error', () => {
    const item: BaseFileItem = { status: 'uploading', name: 'a.txt', size: '1.0KB', uid: 'u1' };
    const { foundation, state, adapter } = makeHarness({}, [item]);
    const err = Object.assign(new Error('boom'), { status: 500, method: 'POST', url: '/x' });
    foundation.handleError(item, err);
    expect(state.fileList[0]!.status).toBe('uploadFail');
    expect(adapter.notifyError).toHaveBeenCalledTimes(1);
  });

  it('afterUpload hook can autoRemove on success', () => {
    const item: BaseFileItem = { status: 'uploading', name: 'a.txt', size: '1.0KB', uid: 'u1' };
    const { foundation, state, adapter } = makeHarness({ afterUpload: true }, [item]);
    (adapter.notifyAfterUpload as ReturnType<typeof vi.fn>).mockReturnValue({ autoRemove: true });
    foundation.handleSuccess(item, {});
    expect(state.fileList).toHaveLength(0);
  });
});

describe('createUpload — remove / clear', () => {
  it('handleRemove releases objectURL and removes the item after beforeRemove resolves', async () => {
    const item: BaseFileItem = { status: 'success', name: 'a.txt', size: '1.0KB', uid: 'u1' };
    const { foundation, state, adapter } = makeHarness({}, [item]);
    foundation.handleRemove(item);
    await Promise.resolve();
    await Promise.resolve();
    expect(state.fileList).toHaveLength(0);
    expect(adapter.releaseObjectUrl).toHaveBeenCalledWith('u1');
    expect(adapter.notifyRemove).toHaveBeenCalledTimes(1);
  });

  it('handleRemove is a no-op when beforeRemove resolves false', async () => {
    const item: BaseFileItem = { status: 'success', name: 'a.txt', size: '1.0KB', uid: 'u1' };
    const { foundation, state, adapter } = makeHarness({}, [item]);
    (adapter.notifyBeforeRemove as ReturnType<typeof vi.fn>).mockReturnValue(false);
    foundation.handleRemove(item);
    await Promise.resolve();
    await Promise.resolve();
    expect(state.fileList).toHaveLength(1);
  });

  it('handleClear empties the list and releases all URLs', async () => {
    const items: BaseFileItem[] = [
      { status: 'success', name: 'a.txt', size: '1.0KB', uid: 'u1' },
      { status: 'success', name: 'b.txt', size: '1.0KB', uid: 'u2' },
    ];
    const { foundation, state, adapter } = makeHarness({}, items);
    foundation.handleClear();
    await Promise.resolve();
    await Promise.resolve();
    expect(state.fileList).toHaveLength(0);
    expect(adapter.releaseAllObjectUrls).toHaveBeenCalledTimes(1);
    expect(adapter.notifyClear).toHaveBeenCalledTimes(1);
  });

  it('disabled: handleRemove/handleClear are no-ops', () => {
    const item: BaseFileItem = { status: 'success', name: 'a.txt', size: '1.0KB', uid: 'u1' };
    const { foundation, state } = makeHarness({ disabled: true }, [item]);
    foundation.handleRemove(item);
    foundation.handleClear();
    expect(state.fileList).toHaveLength(1);
  });
});

describe('createUpload — replace pipeline', () => {
  it('handleReplaceChange swaps the item at replaceIdx, releasing the old URL', () => {
    const oldItem: BaseFileItem = { status: 'success', name: 'old.txt', size: '1.0KB', uid: 'old' };
    const { foundation, state, adapter } = makeHarness({ uploadTrigger: 'custom' }, [oldItem]);
    state.replaceIdx = 0;
    foundation.handleReplaceChange([makeFile('new.txt', 20)]);
    expect(state.fileList).toHaveLength(1);
    expect(state.fileList[0]!.name).toBe('new.txt');
    expect(adapter.releaseObjectUrl).toHaveBeenCalledWith('old');
  });
});

describe('createUpload — drag events', () => {
  it('handleDragEnter returns "legal" unless disabled', () => {
    const { foundation } = makeHarness();
    const e = { currentTarget: {}, preventDefault: vi.fn(), stopPropagation: vi.fn() };
    expect(foundation.handleDragEnter(e as never)).toBe('legal');
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it('handleDragEnter returns "default" when disabled', () => {
    const { foundation } = makeHarness({ disabled: true });
    const e = { currentTarget: {}, preventDefault: vi.fn(), stopPropagation: vi.fn() };
    expect(foundation.handleDragEnter(e as never)).toBe('default');
  });

  it('handleDragLeave returns true only when target matches the enter target', () => {
    const { foundation } = makeHarness();
    const target = {};
    foundation.handleDragEnter({ currentTarget: target, preventDefault: vi.fn(), stopPropagation: vi.fn() } as never);
    expect(
      foundation.handleDragLeave({ target, preventDefault: vi.fn(), stopPropagation: vi.fn() } as never),
    ).toBe(true);
    expect(
      foundation.handleDragLeave({ target: {}, preventDefault: vi.fn(), stopPropagation: vi.fn() } as never),
    ).toBe(false);
  });
});

describe('createUpload — checkFileSize (exposed for render-layer reuse)', () => {
  it('flags files outside [minSize,maxSize] (KB)', () => {
    const { foundation } = makeHarness({ minSize: 1, maxSize: 10 });
    expect(foundation.checkFileSize(makeFile('a', 500))).toBe(true); // < 1KB
    expect(foundation.checkFileSize(makeFile('a', 5000))).toBe(false); // within range
    expect(foundation.checkFileSize(makeFile('a', 20000))).toBe(true); // > 10KB
  });
});
