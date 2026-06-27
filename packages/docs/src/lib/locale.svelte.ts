// 文档站语言状态（zh / en）。用 runes 模块级 $state 做全局单例，
// localStorage 持久化，顶栏切换。SSR 阶段默认 zh，客户端 mount 后同步。
import { browser } from '$app/environment';

export type Lang = 'zh' | 'en';

function readInitial(): Lang {
  if (!browser) return 'zh';
  const saved = localStorage.getItem('cd-lang');
  if (saved === 'zh' || saved === 'en') return saved;
  // 浏览器语言非中文则默认英文
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

let current = $state<Lang>(readInitial());

export const locale = {
  get value(): Lang {
    return current;
  },
  set(lang: Lang) {
    current = lang;
    if (browser) {
      localStorage.setItem('cd-lang', lang);
      document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    }
  },
  toggle() {
    this.set(current === 'zh' ? 'en' : 'zh');
  },
};
