import { useTranslation } from 'react-i18next';

import HelpSection from '../../Help/HelpSection';
import { ContentBox } from '@pxweb2/pxweb2-ui';
import { useLocaleContent } from '../../../util/hooks/useLocaleContent';
import type {
  LocaleContent,
  HelpSection as HelpSectionType,
} from '../../../util/config/localeContentTypes';
import React from 'react';

export function DrawerHelp() {
  const { i18n } = useTranslation();
  const localeContent: LocaleContent | null = useLocaleContent(i18n.language);
  const helpSectionContent: HelpSectionType | undefined =
    localeContent?.tableViewer?.helpSection;

    React.useEffect(() => {
      // Fire a custom event after mount to signal that HelpSection is rendered
      const timeout = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('drawer-help-rendered'));
      }, 0);
      return () => clearTimeout(timeout);
    }, [helpSectionContent]);

  if (!helpSectionContent) {
    return null;
  }

  return (
    <ContentBox>
      <HelpSection helpSectionContent={helpSectionContent} />
    </ContentBox>
  );
}

DrawerHelp.displayName = 'DrawerHelp';
