import { createHighlighterCore, HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

let highlighterPromise: Promise<HighlighterCore> | null = null;

export async function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise = createHighlighterCore({
    themes: [import('@shikijs/themes/github-light')],
    langs: [import('@shikijs/langs/json')],
    engine: createJavaScriptRegexEngine(),
  });

  return highlighterPromise;
}
