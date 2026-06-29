// 文档站语言状态（zh / en）。用 runes 模块级 $state 做全局单例，
// localStorage 持久化，顶栏切换。SSR 阶段默认 zh，客户端 mount 后同步。
import { browser } from '$app/environment';

export type Lang = 'zh' | 'en';

function readInitial(): Lang {
  // 默认恒中文（本设计系统以中文为主）；仅当用户显式切换并持久化后才用其偏好。
  // 不再跟随 navigator.language——避免英文浏览器下与 SSR(zh) 不一致造成首屏闪烁/中英混排。
  if (!browser) return 'zh';
  const saved = localStorage.getItem('cd-lang');
  if (saved === 'zh' || saved === 'en') return saved;
  return 'zh';
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
