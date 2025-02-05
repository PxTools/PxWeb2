import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useState, useContext, useEffect, useRef } from 'react';

import classes from './ContentTop.module.scss';
import {
  BodyLong,
  BodyShort,
  Button,
  Heading,
  Icon,
  Link,
  PxTable,
} from '@pxweb2/pxweb2-ui';
import TableInformation from '../TableInformation/TableInformation';
import { AccessibilityContext } from '../../context/AccessibilityProvider';

export interface ContenetTopProps {
  readonly pxtable: PxTable;
  readonly staticTitle: string;
}

export function ContentTop({ pxtable, staticTitle }: ContenetTopProps) {
  const { t } = useTranslation();
  const [isTableInformationOpen, setIsTableInformationOpen] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('');
  const [tableInformationOpener, setTableInformationOpener] = useState('');
  const accessibility = useContext(AccessibilityContext);
  const openInformationButtonRef = useRef<HTMLButtonElement>(null);
  const openInformationLinkRef = useRef<HTMLAnchorElement>(null);

  const handleOpenTableInformation = (opener: string, selectedTab?: string) => {
    setTableInformationOpener(opener);
    if (selectedTab) {
      setActiveTab(selectedTab);
    }
    setIsTableInformationOpen(true);
  };

  useEffect(() => {
    if (!isTableInformationOpen) {
      if (tableInformationOpener === 'table-information-button') {
        openInformationButtonRef.current?.focus();
      } else if (tableInformationOpener === 'table-information-link') {
        // table-information-link
        openInformationLinkRef.current?.focus();
      }
    }
    accessibility?.addModal('tableInformation', () => {
      setIsTableInformationOpen(false);
    });

    return () => {
      accessibility?.removeModal('tableInformation');
    };
  }, [accessibility, isTableInformationOpen, tableInformationOpener]);

  return (
    <>
      <div className={cl(classes[`content-top`])}>
        <nav
          className={cl(classes.breadcrumbs)}
          aria-label={t('presentation_page.main_content.arialabelbreadcrumb')}
        >
          <div className={cl(classes[`breadcrumbs-wrapper`])}>
            <Link href="#" inline>
              <BodyLong>PxWeb 2.0</BodyLong>
            </Link>
            <Icon iconName="ChevronRight"></Icon>
            <BodyLong>{staticTitle}</BodyLong>
          </div>
        </nav>
        <div
          id="px-main-content"
          className={cl(classes[`heading-information`])}
        >
          <Heading level="1" size="large">
            {pxtable.metadata.label}
          </Heading>
          <div className={cl(classes.information)}>
            <Button
              ref={openInformationButtonRef}
              icon="InformationCircle"
              variant="secondary"
              aria-haspopup="dialog"
              onClick={() => {
                handleOpenTableInformation(
                  'table-information-button',
                  'tab-footnotes',
                );
              }}
            >
              {t('presentation_page.main_content.about_table.title')}
            </Button>
            {pxtable.metadata && (
              <BodyShort size="medium">
                <span className={classes.lastUpdatedLabel}>
                  {t('presentation_page.main_content.last_updated')}:{' '}
                  <Link
                    ref={openInformationLinkRef}
                    href="#"
                    inline
                    aria-haspopup="dialog"
                    onClick={() => {
                      handleOpenTableInformation(
                        'table-information-link',
                        'tab-details',
                      );
                    }}
                  >
                    {t('date.simple_date_with_time', {
                      value: new Date(pxtable.metadata.updated),
                    })}
                  </Link>{' '}
                </span>
              </BodyShort>
            )}
          </div>
        </div>
      </div>
      {isTableInformationOpen && (
        <TableInformation
          isOpen={isTableInformationOpen}
          selectedTab={activeTab}
          onClose={() => {
            setIsTableInformationOpen(false);
          }}
        ></TableInformation>
      )}
    </>
  );
}

export default ContentTop;
