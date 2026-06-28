import { createHighlighter, type Highlighter } from 'shiki';

let hl: Highlighter | null = null;
let loading: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (hl) return hl;
  if (!loading) {
    loading = createHighlighter({
      // vitesse 系：低饱和、柔和雅致，适合放在浅灰/深灰代码块底上
      // （github 主题为纯白/纯黑底调色，放到我们的灰底上偏生硬不协调）
      themes: ['vitesse-light', 'vitesse-dark'],
      langs: ['svelte', 'typescript', 'bash'],
    }).then((h) => {
      hl = h;
      return h;
    });
  }
  return loading;
}

export async function highlight(code: string, lang = 'svelte'): Promise<string> {
  const h = await getHighlighter();
  return h.codeToHtml(code, {
    lang,
    themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
    defaultColor: false,
  });
}
