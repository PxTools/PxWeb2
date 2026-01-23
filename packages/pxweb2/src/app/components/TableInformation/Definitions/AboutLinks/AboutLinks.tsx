import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './AboutLinks.module.scss';
import { Heading, BodyLong, LinkCard } from '@pxweb2/pxweb2-ui';

interface AboutTextsProps {
  readonly title: string;
  readonly description: string;
}

function AboutTexts({ title, description }: AboutTextsProps) {
  return (
    <div className={cl(classes.textContainer)}>
      <Heading level={'3'} size="small" spacing={true}>
        {title}
      </Heading>
      <BodyLong size="medium">{description}</BodyLong>
    </div>
  );
}

interface AboutLinksProps {
  readonly statisticsHomepage: {
    href: string;
    label: string;
  };
  readonly aboutStatistic?: {
    href: string;
    label: string;
  };
}

export function AboutLinks({
  statisticsHomepage,
  aboutStatistic,
}: AboutLinksProps) {
  const { t } = useTranslation();

  if (!statisticsHomepage) {
    return null;
  }

  const aboutStatisticsTitle = t(
    'presentation_page.main_content.about_table.definitions.about_statistics.title',
  );
  const aboutStatisticsDescription = t(
    'presentation_page.main_content.about_table.definitions.about_statistics.description',
  );
  const linkTextStatisticsHomepage = t(
    'presentation_page.main_content.about_table.definitions.about_statistics.link_text_statistics_homepage',
  );
  const linkTextAboutDefinitions = t(
    'presentation_page.main_content.about_table.definitions.about_statistics.link_text_definitions',
  );

  const hasCustomAboutStatisticsTitle = aboutStatisticsTitle.length > 0;
  const hasCustomLinkTextStatisticsHomepage =
    linkTextStatisticsHomepage.length > 0;
  const hasCustomLinkTextAboutDefinitions = linkTextAboutDefinitions.length > 0;

  const statisticsHomepageText = hasCustomLinkTextStatisticsHomepage
    ? linkTextStatisticsHomepage
    : statisticsHomepage.label;
  const aboutStatisticsText = hasCustomLinkTextAboutDefinitions
    ? linkTextAboutDefinitions
    : aboutStatistic?.label;

  return (
    <div className={cl(classes.aboutLinks)}>
      {hasCustomAboutStatisticsTitle && (
        <AboutTexts
          title={aboutStatisticsTitle}
          description={aboutStatisticsDescription}
        />
      )}
      <div className={cl(classes.linkCardContainer)}>
        {/* <p>(The links below should be LinkCard components)</p> */}
        <LinkCard
          href={statisticsHomepage.href}
          headingText={statisticsHomepageText}
          size="small"
        ></LinkCard>

        {aboutStatistic && (
          <LinkCard
            href={aboutStatistic.href}
            headingText={aboutStatisticsText || ''}
            size="small"
          ></LinkCard>
        )}
      </div>
    </div>
  );
}
