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
  const mdTextEscaped = escapeDecimalLikeLabels(mdText);
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
      {mdTextEscaped}
    </ReactMarkdown>
  );
};
