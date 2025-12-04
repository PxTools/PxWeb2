import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/github.css';

import { HighlightOptions } from './CodeSnippet';

export function highlightCode(code: string, lang: HighlightOptions) {
  const validInput =
    typeof code === 'string' &&
    code.length > 0 &&
    typeof lang === 'string' &&
    lang.length > 0;

  hljs.registerLanguage('json', json);

  if (validInput && hljs.getLanguage(lang)) {
    return hljs.highlight(code, { language: lang }).value;
  }

  return code;
}
