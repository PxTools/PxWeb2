import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

const highlighter = await createHighlighterCore({
  themes: [import('@shikijs/themes/github-light')],
  langs: [import('@shikijs/langs/json')],
  engine: createJavaScriptRegexEngine(),
});

export function getHighlighter() {
  return highlighter;
}
