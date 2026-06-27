import { createHighlighter, type Highlighter } from 'shiki';

let hl: Highlighter | null = null;
let loading: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (hl) return hl;
  if (!loading) {
    loading = createHighlighter({
      themes: ['github-light', 'github-dark'],
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
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });
}
