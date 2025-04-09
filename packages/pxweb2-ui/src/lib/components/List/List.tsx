import React from 'react';
import cl from 'clsx';

import classes from './List.module.scss';
import Heading from '../Typography/Heading/Heading';
export interface ListProps {
  heading?: string;
  subHeading?: string;
  listType: 'ul' | 'ol';
  listGroup?: boolean;
  nested?: boolean;
  children: React.ReactNode;
}

export function List({
  heading,
  subHeading,
  listType = 'ol',
  listGroup = false,
  nested = false,
  children,
}: Readonly<ListProps>) {
  const listclassextension = listGroup ? '-listgroup' : '';
  if (nested) {
    heading = undefined;
    subHeading = undefined;
    listGroup = false;
  }

  return (
    <div className={cl(classes[`list-component-wrapper`])}>
      {heading && (
        <div className={cl(classes[`heading-wrapper`])}>
          <Heading size={'small'} level={'3'}>
            {heading}
          </Heading>
        </div>
      )}
      {!listGroup && subHeading && (
        <div className={cl(classes[`sub-heading-wrapper`])}>
          {
            <Heading size={'xsmall'} level={'4'}>
              {subHeading}
            </Heading>
          }
        </div>
      )}
      <div className={cl(classes[`list-wrapper${listclassextension}`])}>
        {React.createElement(listType, { role: 'list' }, children)}
      </div>
    </div>
  );
}

export default List;
