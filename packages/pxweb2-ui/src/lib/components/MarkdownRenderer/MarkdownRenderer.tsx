import React from 'react';
import ReactMarkdown from 'react-markdown';

import Link from '../Link/Link';

type MdProps = {
  mdText: string;
};

type LinkProps = { href?: string; children?: React.ReactNode };
type UnwantedMdRenderProps = { children?: React.ReactNode };

const LinkRenderer = ({ href = '', children }: LinkProps) => (
  <Link href={href} target="_blank" rel="noopener noreferrer" inline>
    {children}
  </Link>
);

const UnwantedMdRender = ({ children }: UnwantedMdRenderProps) => (
  <>{children}</>
);

const MarkdownRenderer: React.FC<MdProps> = ({ mdText }) => {
  return (
    <ReactMarkdown
      components={{
        a: LinkRenderer,
        p: UnwantedMdRender,
        ul: UnwantedMdRender,
        ol: UnwantedMdRender,
        li: UnwantedMdRender,
        em: UnwantedMdRender,
        strong: UnwantedMdRender,
      }}
      skipHtml={false} // Enable raw HTML rendering
    >
      {mdText}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
