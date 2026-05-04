import React from 'react';
import ReactMarkdown from 'react-markdown';

import Link from '../Link/Link';

type MdProps = {
  mdText: string;
};

type LinkProps = { href?: string; children?: React.ReactNode };
type UnwantedMdRenderProps = { children?: React.ReactNode };

function escapeDecimalLikeLabels(markdown: string): string {
  // Lines like "4.1 some text" → "4\.1 some text"
  return markdown.replace(/^(\d+)\.(?=\s)/gm, '$1\\.');
}

function normalizeNewLines(markdown: string): string {
  return markdown
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\r\n|\r/g, '\n');
}

function newLineToBreak(markdown: string): string {
  const emptyRowToken = '__PXWEB_EMPTY_ROW__';
  const blankLineGroupRegex = /\n[ \t]*\n+/g;

  // Mark blank-line groups first, then convert all remaining newlines to hard breaks.
  const withMarkedEmptyRows = markdown.replace(
    blankLineGroupRegex,
    `\n${emptyRowToken}\n`,
  );

  return withMarkedEmptyRows
    .split('\n')
    .map((line) => (line === emptyRowToken ? '&nbsp;' : line))
    .join('  \n');
}

const LinkRenderer = ({ href = '', children }: LinkProps) => (
  <Link href={href} target="_blank" rel="noopener noreferrer" inline>
    {children}
  </Link>
);

const ItalicRenderer = ({ children }: UnwantedMdRenderProps) => (
  <span style={{ fontFamily: 'PxWeb-font', fontStyle: 'italic' }}>
    {children}
  </span>
);

const UnwantedMdRender = ({ children }: UnwantedMdRenderProps) => (
  <>{children}</>
);

export const MarkdownRenderer: React.FC<MdProps> = ({ mdText }) => {
  const mdTextNormalized = normalizeNewLines(mdText);
  const mdTextEscaped = escapeDecimalLikeLabels(mdTextNormalized);
  const mdTextWithBreaks = newLineToBreak(mdTextEscaped);

  return (
    <ReactMarkdown
      components={{
        a: LinkRenderer,
        p: UnwantedMdRender,
        strong: UnwantedMdRender,
        em: ItalicRenderer,
      }}
      skipHtml={false} // Enable raw HTML rendering
    >
      {mdTextWithBreaks}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
