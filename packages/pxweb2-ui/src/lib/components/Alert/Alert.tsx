import React, { useState } from 'react';
import cl from 'clsx';

import { useTranslation } from 'react-i18next';
import classes from './Alert.module.scss';
import BodyLong from '../Typography/BodyLong/BodyLong';
import Heading from '../Typography/Heading/Heading';
import { Icon, IconProps } from '../Icon/Icon';
import Button from '../Button/Button';
import BodyShort from '../Typography/BodyShort/BodyShort';
import List, { ListProps } from '../List/List';

//import { ListItem, ListProps } from 'react-virtuoso';

export interface AlertProps {
  size?: 'small' | 'medium';
  variant: 'info' | 'success' | 'warning' | 'error';
  clickable?: boolean;
  closeButton?: boolean;
  heading?: string;
  onClick?: () => void;
  children?: string | React.ReactNode;
}

export function Alert({
  size = 'medium',
  variant = 'info',
  clickable = false,
  closeButton = false,
  heading = '',
  onClick,
  children,
}: AlertProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const HandleClose = () => {
    setIsVisible(false);
  };
  if (!isVisible) {
    return null;
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onClick && onClick();
    }
  };
  let hasheading: boolean;
  heading ? (hasheading = true) : (hasheading = false);
  const iconRight = 'ArrowRight';
  const iconClose = 'XMark';
  let variantIcon: IconProps['iconName'];
  switch (variant) {
    case 'info':
      variantIcon = 'InformationCircleFilled';
      break;
    case 'success':
      variantIcon = 'CheckMarkCircleFilled';
      break;
    case 'warning':
      variantIcon = 'ExclamationMarkFilled';
      break;
    case 'error':
      variantIcon = 'XMarkCircleFilled';
      break;

    default:
      variantIcon = 'XMarkCircleFilled';
  }
  let headingSize: 'small' | 'xsmall';
  const bodySize = 'medium';

  switch (size) {
    case 'small':
      headingSize = 'xsmall';
      break;
    case 'medium':
      headingSize = 'small';
      break;
    default:
      headingSize = 'small';
  }
  if (clickable) {
    closeButton = false;
  }

  const childIsList = (node: React.ReactNode): boolean => {
    if (React.isValidElement(node)) {
      if (node.type === List) {
        return true;
      }
    }
    return false;
  };

  // const createClickableFootnote = (
  //   listNote: React.ReactNode,
  // ): string | undefined => {
  //   let ListNotesAsString = '';
  //   if (React.isValidElement(listNote) && listNote.type === List) {
  //     const listProps = listNote.props as ListProps; // Cast to ListProps
  //     // ListNotesAsString = listProps.heading ? listProps.heading + ': ' : '';
  //     ListNotesAsString = listProps.subHeading
  //       ? ListNotesAsString + listProps.subHeading + ': '
  //       : '';
  //     if (listProps.children) {
  //       if (Array.isArray(listProps.children)) {
  //         listProps.children.forEach((child) => {
  //           if (React.isValidElement(child)) {
  //             if (child.type === ListItem) {
  //               const listItemChild = child as React.ReactElement<{
  //                 children: ReactElement;
  //               }>;
  //               if (React.isValidElement(listItemChild.props.children)) {
  //                 const numberOfChildren = React.Children.count(
  //                   listItemChild.props.children,
  //                 );
  //                 ListNotesAsString =
  //                   ListNotesAsString + 'COUNT=' + numberOfChildren;
  //                 if (numberOfChildren > 1) {
  //                   ListNotesAsString + '7777';
  //                   const nestedList = listItemChild.props
  //                     .children as React.ReactElement;
  //                   ListNotesAsString =
  //                     ListNotesAsString + createClickableFootnote(nestedList);
  //                 }
  //                 if (listItemChild.props.children.type === List) {
  //                   ListNotesAsString = ListNotesAsString + '8888';
  //                   const nestedList = listItemChild.props
  //                     .children as React.ReactElement;
  //                   ListNotesAsString =
  //                     ListNotesAsString + createClickableFootnote(nestedList);
  //                 }
  //               } else {
  //                 ListNotesAsString = ListNotesAsString + '999';
  //                 ListNotesAsString =
  //                   ListNotesAsString +
  //                   React.Children.count(listItemChild.props.children);
  //                 ListNotesAsString =
  //                   ListNotesAsString +
  //                   ' ' +
  //                   listItemChild.props.children.toString();
  //               }
  //             }
  //           }
  //         });
  //       } else {
  //         const OnlyChild = listProps.children as React.ReactElement;

  //         if (OnlyChild.type === ListItem) {
  //           const listChild = OnlyChild as React.ReactElement<ListProps>;
  //           ListNotesAsString =
  //             ListNotesAsString + 'X' + listChild.props.children?.toString();
  //         }
  //         if (OnlyChild.type === Link) {
  //           const linkchild = OnlyChild as React.ReactElement<LinkProps>;
  //           ListNotesAsString =
  //             ListNotesAsString + 'Y' + linkchild.props.children?.toString();
  //         }
  //       }
  //     }
  //   }
  //   return ListNotesAsString;
  // };

  // const createClickableFootnote2 = (
  //   listNote: React.ReactNode,
  //   frahvor?: string,
  // ): string | undefined => {
  //   let ListNotesAsString = '';
  //   const isString = (node: React.ReactNode) => typeof node === 'string';
  //   const isLink = (node: React.ReactElement) => node.type === Link;
  //   const isListItem = (node: React.ReactElement) => node.type === ListItem;
  //   const isList = (node: React.ReactElement) => node.type === List;
  //   ListNotesAsString = ListNotesAsString + 'frahvor=' + frahvor;
  //   if (listNote.type != List && listNote.type != ListItem) {
  //     ListNotesAsString =
  //       ListNotesAsString + 'start=' + listNote.type + 'frahvor=' + frahvor;
  //   }
  //   if (React.isValidElement(listNote)) {
  //     React.Children.forEach(listNote, (child) => {
  //       if (React.isValidElement(child)) {
  //         ListNotesAsString = ListNotesAsString + 'ccc';
  //         if (isString(child)) {
  //           ListNotesAsString = ListNotesAsString + 'ddd';
  //           ListNotesAsString += child.props;
  //         } else if (isLink(child)) {
  //           ListNotesAsString = ListNotesAsString + 'eee';
  //           const linkChild = child.props as React.ReactElement<LinkProps>;
  //           ListNotesAsString += createClickableFootnote2(
  //             linkChild.props.children,
  //           );
  //         } else if (isListItem(child)) {
  //           ListNotesAsString = ListNotesAsString + 'f1';
  //           const listItemChild = child as React.ReactElement<ListItemProps>;
  //           const numberOfChildren = React.Children.count(
  //             listItemChild.props.children,
  //           );
  //           ListNotesAsString = ListNotesAsString + 'f2=' + numberOfChildren;
  //           const childrenArray = React.Children.toArray(
  //             listItemChild.props.children,
  //           );

  //           if (childrenArray.length === 1) {
  //             ListNotesAsString += 'ONLYONE' + childrenArray[0].toString();
  //           } else {
  //             React.Children.forEach(childrenArray, (item) => {
  //               if (React.isValidElement(item)) {
  //                 ListNotesAsString += createClickableFootnote2(
  //                   item as React.ReactNode,
  //                   'fralistitem',
  //                 );
  //                 ListNotesAsString += item.props + 'f3';
  //               }
  //             });
  //           }
  //         } else if (isList(child)) {
  //           ListNotesAsString = ListNotesAsString + 'ggg';
  //           const listChild = child as React.ReactElement<ListProps>;
  //           // ListNotesAsString += listChild.props.children;
  //           const nestedList = listChild.props.children;
  //           React.Children.forEach(nestedList, (item) => {
  //             if (React.isValidElement(item)) {
  //               ListNotesAsString += createClickableFootnote2(
  //                 item as React.ReactNode,
  //                 'fralist',
  //               );
  //             }
  //           });
  //         } else {
  //           ListNotesAsString = ListNotesAsString + 'UUUUU';
  //           ListNotesAsString += child.props;
  //         }
  //       }
  //     });
  //   }

  //   return ListNotesAsString;
  // };

  const extractTextFromChildren = (children: React.ReactNode): string => {
    let textContent = '';

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        // If the child is a valid React element, check its children recursively
        if (React.isValidElement(child) && child.type === List) {
          textContent += ' ' + (child.props as ListProps)?.subHeading + ': ';
        }
        if (
          typeof child.props === 'object' &&
          child.props !== null &&
          'children' in child.props
        ) {
          textContent += extractTextFromChildren(
            child.props.children as React.ReactNode,
          );
        }
      } else if (typeof child === 'string' || typeof child === 'number') {
        // If the child is a string or number, add it to the text content
        textContent += ' ' + child.toString();
      }
    });

    return textContent;
  };

  // function extractTextFromElement(element: HTMLElement): string {
  //   let text = '';
  //   for (let child of Array.from(element.childNodes)) {
  //     if (child.nodeType === Node.TEXT_NODE) {
  //       text += child.textContent;
  //     } else if (child.nodeType === Node.ELEMENT_NODE) {
  //       text += extractTextFromElement(child as HTMLElement);
  //     }
  //   }
  //   return text;
  // }

  // if (childIsList(children) && clickable) {
  //   const listNote = children as React.ReactElement<ListProps>;
  //   //const clickableFootnote = createClickableFootnote(listNote);
  //   const clickableFootnote = createClickableFootnote2(listNote);
  //   children = clickableFootnote;
  //   console.log(clickableFootnote);
  // }

  if (childIsList(children) && clickable) {
    let extractedText = '';
    if (React.isValidElement(children) && children.type === List) {
      const listProps = children.props as ListProps;
      extractedText = extractTextFromChildren(listProps.children);
      console.log('Extracted Text:', children);
    }
    children = extractedText;
  }

  return (
    <div
      onKeyDown={clickable ? handleKeyDown : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={cl(classes[`alert-${size}`], classes[variant], {
        [classes[`${variant}-clickable`]]: clickable,
      })}
      onClick={clickable ? onClick : undefined}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <div className={classes[`alert-section-left-${size}`]}>
        <Icon
          iconName={variantIcon}
          className={classes[`alert-icon-${variant}`]}
        ></Icon>
      </div>
      <div className={cl(classes[`alert-section-middle-${size}`])}>
        {hasheading && (
          <div
            className={cl(classes[`alert-heading`], {
              [classes[`alert-heading-clickable`]]: clickable,
            })}
          >
            <Heading size={headingSize} level="2">
              {heading}
            </Heading>
          </div>
        )}
        <div
          className={cl(classes[`alert-body-${size}`], {
            [classes[`truncate-text-${size}`]]: clickable,
          })}
        >
          {size === 'small' ? (
            <BodyShort size={bodySize}>{children}</BodyShort>
          ) : (
            <BodyLong size={bodySize}>{children}</BodyLong>
          )}
        </div>
      </div>
      <div
        className={cl(
          classes[`alert-section-right`],
          {
            [classes[`alert-xmark`]]: closeButton,
          },
          {
            [classes[`alert-arrow-wrapper`]]: clickable,
          },
        )}
      >
        {closeButton && (
          <div className={cl(classes['alert-xmark-wrapper'])}>
            <Button
              variant="tertiary"
              size="small"
              icon={iconClose}
              onClick={HandleClose}
              aria-label={t('common.generic_buttons.close')}
            />
          </div>
        )}
        {clickable && (
          <div className={cl(classes['alert-arrow-wrapper'])}>
            {' '}
            <Icon iconName={iconRight} className=""></Icon>
          </div>
        )}
      </div>
    </div>
  );
}

export default Alert;
