import React from 'react';
import cl from 'clsx';

import classes from './List.module.scss';
import Heading from '../Typography/Heading/Heading';
import BodyLong from '../Typography/BodyLong/BodyLong';
interface ListProps {
  heading?: string;
  subHeading?: string;
  listType: 'ul' | 'ol';
  nested?: boolean;
  listGroup?: boolean;
  listSubType?: 'nested' | 'listgroup' | 'default';
  children: React.ReactNode;
}

export function List({
  heading,
  subHeading,
  listType: listType = 'ol',
  nested = false,
  listGroup = false,
  listSubType = 'default',
  children,
}: ListProps) {
  let listclassextension = '';
  switch (listSubType) {
    case 'nested':
      listclassextension = '-nested';
      break;
    case 'listgroup':
      listclassextension = '-listgroup';
      break;
    default:
      break;
  }

  return (
    <div className={cl(classes[`list-component-wrapper`])}>
      {/* <BodyLong> */}
      {heading && (
        <div className={cl(classes[`heading-wrapper`])}>
          <Heading size={'small'}>{heading}</Heading>
        </div>
      )}
      <div className={cl(classes[`sub-heading-wrapper`])}>
        {subHeading && <Heading size={'xsmall'}>{subHeading}</Heading>}
      </div>
      {/* </BodyLong> */}
      <div
        className={cl(
          // classes[`list-wrapper${nested ? '-nested' : ''}`],
          classes[`list-wrapper${listclassextension}`],
        )}
      >
        {React.createElement(listType, {}, children)}
      </div>
    </div>
  );
}

export default List;
