import React from 'react';
import cl from 'clsx';

import classes from './List.module.scss';
import Heading from '../Typography/Heading/Heading';
interface ListProps {
  heading?: string;
  subHeading?: string;
  listType: 'ul' | 'ol';
  listGroup?: boolean;
  nested?: boolean;
  // listSubType?: 'nested' | 'listgroup' | 'default';
  children: React.ReactNode;
}

export function List({
  heading,
  subHeading,
  listType: listType = 'ol',
  listGroup = false,
  nested = false,
  // listSubType = 'default',
  children,
}: ListProps) {
  const listclassextension = listGroup ? '-listgroup' : '';
  if (nested) {
    heading = undefined;
    subHeading = undefined;
    listGroup = false;
  }

  // let listclassextension = '';
  // switch (listSubType) {
  //   case 'nested':
  //     listclassextension = '-nested';
  //     break;
  //   case 'listgroup':
  //     listclassextension = '-listgroup';
  //     break;
  //   default:
  //     break;
  // }

  return (
    <div className={cl(classes[`list-component-wrapper`])}>
      {heading && (
        <div className={cl(classes[`heading-wrapper`])}>
          <Heading size={'small'}>{heading}</Heading>
        </div>
      )}
      {/* {listSubType !== 'listgroup' && subHeading && ( */}
      {!listGroup && subHeading && (
        <div className={cl(classes[`sub-heading-wrapper`])}>
          {<Heading size={'xsmall'}>{subHeading}</Heading>}
        </div>
      )}
      <div className={cl(classes[`list-wrapper${listclassextension}`])}>
        {React.createElement(listType, { role: 'list' }, children)}
      </div>
    </div>
  );
}

export default List;
