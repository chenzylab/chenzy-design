// 搜索面板空态的用户偏好：搜索历史 + 最近浏览。localStorage 持久化，跨会话保留。
// 对齐 Semi 搜索面板：未输入时展示「搜索历史 / 最近浏览 / 快速访问」引导区。
import { browser } from '$app/environment';

const HISTORY_KEY = 'cd-docs:search-history';
const RECENT_KEY = 'cd-docs:recent-components';
const HISTORY_MAX = 8;
const RECENT_MAX = 5;

function read(key: string): string[] {
  if (!browser) return [];
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function write(key: string, list: string[]) {
  if (!browser) return;
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // 隐私模式 / 配额满时静默降级
  }
}

// —— 搜索历史（关键词）——
export const searchHistory = $state<{ items: string[] }>({ items: read(HISTORY_KEY) });

/** 记录一次搜索关键词：去重后置顶，超上限截断。 */
export function pushSearchHistory(term: string) {
  const q = term.trim();
  if (!q) return;
  const next = [q, ...searchHistory.items.filter((x) => x !== q)].slice(0, HISTORY_MAX);
  searchHistory.items = next;
  write(HISTORY_KEY, next);
}

export function clearSearchHistory() {
  searchHistory.items = [];
  write(HISTORY_KEY, []);
}

/** 删除单个搜索历史关键词。 */
export function removeSearchHistory(term: string) {
  const next = searchHistory.items.filter((x) => x !== term);
  searchHistory.items = next;
  write(HISTORY_KEY, next);
}

// —— 最近浏览（组件 lowercase name）——
export const recentComponents = $state<{ items: string[] }>({ items: read(RECENT_KEY) });

/** 记录一次组件页访问：去重后置顶，超上限截断。 */
export function pushRecentComponent(name: string) {
  const n = name.trim().toLowerCase();
  if (!n) return;
  const next = [n, ...recentComponents.items.filter((x) => x !== n)].slice(0, RECENT_MAX);
  recentComponents.items = next;
  write(RECENT_KEY, next);
}
