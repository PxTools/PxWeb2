import { useTranslation } from 'react-i18next';

import HelpSection from '../../Help/HelpSection';
import { ContentBox } from '@pxweb2/pxweb2-ui';
import { useLocaleContent } from '../../../util/hooks/useLocaleContent';
import type {
  LocaleContent,
  HelpSection as HelpSectionType,
} from '../../../util/config/localeContentTypes';

export function DrawerHelp() {
  const { i18n } = useTranslation();
  const localeContent: LocaleContent | null = useLocaleContent(i18n.language);
  const helpSectionContent: HelpSectionType | undefined =
    localeContent?.tableViewer?.helpSection;

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
