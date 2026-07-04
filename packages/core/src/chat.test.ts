import { describe, expect, it } from 'vitest';
import {
  CHAT_ROLE,
  MESSAGE_STATUS,
  SEND_HOT_KEY,
  SHOW_SCROLL_GAP,
  SCROLL_ANIMATION_TIME,
  shouldShowBackBottom,
  resolveEnableUpload,
  shouldSendOnEnter,
  isImageAttachment,
  buildSendContent,
  appendDivider,
  makeUserMessage,
  deleteMessageFrom,
  toggleLike,
  toggleDislike,
  resetLastMessage,
  type Content,
  type Message,
  type ChatAttachment,
} from './chat.js';

describe('chat constants', () => {
  it('exposes Semi-aligned constants', () => {
    expect(SHOW_SCROLL_GAP).toBe(100);
    expect(SCROLL_ANIMATION_TIME).toBe(300);
    expect(CHAT_ROLE.DIVIDER).toBe('divider');
    expect(MESSAGE_STATUS.LOADING).toBe('loading');
    expect(SEND_HOT_KEY.SHIFT_PLUS_ENTER).toBe('shift+enter');
  });
});

describe('shouldShowBackBottom', () => {
  it('hides within gap of the bottom', () => {
    // distance = 1000 - 950 - 50 = 0 <= 100 → hidden
    expect(shouldShowBackBottom(1000, 950, 50)).toBe(false);
  });
  it('shows when scrolled up beyond gap', () => {
    // distance = 1000 - 300 - 50 = 650 > 100 → visible
    expect(shouldShowBackBottom(1000, 300, 50)).toBe(true);
  });
  it('boundary: exactly gap → hidden', () => {
    // distance = 1000 - 850 - 50 = 100, not > 100 → hidden
    expect(shouldShowBackBottom(1000, 850, 50)).toBe(false);
  });
  it('boundary: one px beyond gap → visible', () => {
    expect(shouldShowBackBottom(1000, 849, 50)).toBe(true);
  });
});

describe('resolveEnableUpload (三态)', () => {
  it('undefined → all true', () => {
    expect(resolveEnableUpload(undefined)).toEqual({
      dragUpload: true,
      clickUpload: true,
      pasteUpload: true,
    });
  });
  it('boolean true → all true', () => {
    expect(resolveEnableUpload(true)).toEqual({
      dragUpload: true,
      clickUpload: true,
      pasteUpload: true,
    });
  });
  it('boolean false → all false', () => {
    expect(resolveEnableUpload(false)).toEqual({
      dragUpload: false,
      clickUpload: false,
      pasteUpload: false,
    });
  });
  it('object → per-field, missing defaults true', () => {
    expect(resolveEnableUpload({ clickUpload: false })).toEqual({
      dragUpload: true,
      clickUpload: false,
      pasteUpload: true,
    });
  });
  it('object all false', () => {
    expect(
      resolveEnableUpload({ clickUpload: false, dragUpload: false, pasteUpload: false }),
    ).toEqual({ dragUpload: false, clickUpload: false, pasteUpload: false });
  });
});

describe('shouldSendOnEnter', () => {
  it('enter: plain Enter sends', () => {
    expect(shouldSendOnEnter('enter', false)).toBe(true);
  });
  it('enter: Shift+Enter does not send (newline)', () => {
    expect(shouldSendOnEnter('enter', true)).toBe(false);
  });
  it('shift+enter: plain Enter does not send (newline)', () => {
    expect(shouldSendOnEnter('shift+enter', false)).toBe(false);
  });
  it('shift+enter: Shift+Enter sends', () => {
    expect(shouldSendOnEnter('shift+enter', true)).toBe(true);
  });
});

describe('isImageAttachment', () => {
  it('detects by MIME prefix', () => {
    expect(isImageAttachment({ name: 'x', fileInstance: { type: 'image/png' } })).toBe(true);
  });
  it('detects by suffix', () => {
    expect(isImageAttachment({ name: 'photo.JPEG' })).toBe(true);
  });
  it('non-image file', () => {
    expect(isImageAttachment({ name: 'doc.pdf', fileInstance: { type: 'application/pdf' } })).toBe(
      false,
    );
  });
});

describe('buildSendContent', () => {
  it('no attachment → plain text string', () => {
    expect(buildSendContent('hello', [])).toBe('hello');
  });
  it('text + image + file → Content[]', () => {
    const attachment: ChatAttachment[] = [
      { name: 'a.png', url: 'blob:img', fileInstance: { type: 'image/png' } },
      { name: 'b.pdf', url: 'blob:pdf', size: 10, fileInstance: { type: 'application/pdf' } },
    ];
    const content = buildSendContent('hi', attachment) as Content[];
    expect(content[0]).toEqual({ type: 'text', text: 'hi' });
    expect(content[1]).toEqual({ type: 'image_url', image_url: { url: 'blob:img' } });
    expect(content[2]).toEqual({
      type: 'file_url',
      file_url: { url: 'blob:pdf', name: 'b.pdf', size: 10, type: 'application/pdf' },
    });
  });
  it('empty text with attachment → no leading text node', () => {
    const content = buildSendContent('', [
      { name: 'a.png', url: 'u', fileInstance: { type: 'image/png' } },
    ]) as Content[];
    expect(content).toHaveLength(1);
    expect(content[0]!.type).toBe('image_url');
  });
});

describe('appendDivider (clearContext)', () => {
  const makeId = () => 'id-div';
  it('appends a divider message', () => {
    const chats: Message[] = [{ id: '1', role: 'user', content: 'x' }];
    const next = appendDivider(chats, makeId, () => 1000);
    expect(next).toHaveLength(2);
    expect(next[1]).toEqual({ role: CHAT_ROLE.DIVIDER, id: 'id-div', createAt: 1000 });
  });
  it('skips when last already divider', () => {
    const chats: Message[] = [{ id: 'd', role: CHAT_ROLE.DIVIDER }];
    expect(appendDivider(chats, makeId)).toBe(chats);
  });
});

describe('makeUserMessage', () => {
  it('builds a user message', () => {
    const m = makeUserMessage('hi', () => 'uid', () => 42);
    expect(m).toEqual({ role: CHAT_ROLE.USER, id: 'uid', createAt: 42, content: 'hi' });
  });
});

describe('delete / like / dislike / reset', () => {
  const base: Message[] = [
    { id: '1', role: 'user', content: 'a' },
    { id: '2', role: 'assistant', content: 'b' },
  ];

  it('deleteMessageFrom removes by id', () => {
    const next = deleteMessageFrom(base, { id: '1' });
    expect(next).toHaveLength(1);
    expect(next[0]!.id).toBe('2');
  });

  it('toggleLike sets like true, dislike false', () => {
    const next = toggleLike(base, { id: '2' });
    expect(next[1]!.like).toBe(true);
    expect(next[1]!.dislike).toBe(false);
    // untouched message unchanged
    expect(next[0]).toBe(base[0]);
  });

  it('toggleLike is a toggle', () => {
    const liked = toggleLike(base, { id: '2' });
    const unliked = toggleLike(liked, { id: '2' });
    expect(unliked[1]!.like).toBe(false);
  });

  it('toggleDislike sets dislike true, like false', () => {
    const next = toggleDislike(base, { id: '2' });
    expect(next[1]!.dislike).toBe(true);
    expect(next[1]!.like).toBe(false);
  });

  it('like then dislike clears like', () => {
    const liked = toggleLike(base, { id: '2' });
    const disliked = toggleDislike(liked, { id: '2' });
    expect(disliked[1]!.like).toBe(false);
    expect(disliked[1]!.dislike).toBe(true);
  });

  it('resetLastMessage resets tail to loading', () => {
    const next = resetLastMessage(base, () => 'new', () => 99);
    expect(next[1]).toEqual({
      id: 'new',
      role: 'assistant',
      content: '',
      status: MESSAGE_STATUS.LOADING,
      createAt: 99,
    });
    // previous untouched
    expect(next[0]).toBe(base[0]);
  });

  it('missing target id is a no-op', () => {
    expect(toggleLike(base, { id: 'nope' })).toBe(base);
    expect(toggleDislike(base, { id: 'nope' })).toBe(base);
  });
});
