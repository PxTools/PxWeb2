import React from 'react';
import ReactMarkdown from 'react-markdown';

import Link from '../Link/Link';

interface Props {
  mdText: string;
}

const MarkdownRenderer: React.FC<Props> = ({ mdText }) => {
  return (
    <ReactMarkdown
      components={{
        a: ({ href, children }) => (
          <Link
            href={href ?? ''}
            target="_blank"
            rel="noopener noreferrer"
            inline
          >
            {children}
          </Link>
        ),
      }}
      disallowedElements={['audio', 'video', 'img']} // Disallow audio, video and images in markdown
    >
      {mdText}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
