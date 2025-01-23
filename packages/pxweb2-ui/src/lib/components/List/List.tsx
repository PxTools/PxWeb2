import React from 'react';
import cl from 'clsx';

import classes from './List.module.scss';
import Heading from '../Typography/Heading/Heading';
import BodyLong from '../Typography/BodyLong/BodyLong';
interface ListProps {
  heading?: string;
  subHeading?: string;
  listType: 'ul' | 'ol';
  children: React.ReactNode;
}

export function List({
  heading = 'default heading',
  subHeading,
  listType: listType = 'ol',
  children,
}: ListProps) {
  return (
    <>
      <BodyLong>
        {heading && (
          <div className={cl(classes[`heading-wrapper`])}>
            <Heading size={'small'}>{heading}</Heading>
          </div>
        )}
        {subHeading && <Heading size={'xsmall'}>{heading}</Heading>}
      </BodyLong>
      <div className={cl(classes[`list-wrapper`])}>
        {React.createElement(listType, {}, children)}
      </div>
    </>
  );
}

export default List;
