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
  readonly definitionsLink: {
    href: string;
    label: string;
  };
  readonly homepageLink?: {
    href: string;
    label: string;
  };
}

export function AboutLinks({ definitionsLink, homepageLink }: AboutLinksProps) {
  const { t } = useTranslation();

  if (!definitionsLink) {
    return null;
  }

  const aboutStatisticsTitle = t(
    'presentation_page.main_content.about_table.definitions.about_statistics.title',
  );
  const aboutStatisticsDescription = t(
    'presentation_page.main_content.about_table.definitions.about_statistics.description',
  );
  const linkTextHomepage = t(
    'presentation_page.main_content.about_table.definitions.about_statistics.link_text_homepage',
  );
  const linkTextDefinitions = t(
    'presentation_page.main_content.about_table.definitions.about_statistics.link_text_definitions',
  );

  const hasCustomAboutStatisticsTitle = aboutStatisticsTitle.length > 0;
  const hasCustomHomepageLinkText = linkTextHomepage.length > 0;
  const hasCustomDefinitionsLinkText = linkTextDefinitions.length > 0;

  const homepageLinkText = hasCustomHomepageLinkText
    ? linkTextHomepage
    : homepageLink?.label;
  const definitionsLinkText = hasCustomDefinitionsLinkText
    ? linkTextDefinitions
    : definitionsLink?.label;

  return (
    <div className={cl(classes.aboutLinks)}>
      {hasCustomAboutStatisticsTitle && (
        <AboutTexts
          title={aboutStatisticsTitle}
          description={aboutStatisticsDescription}
        />
      )}
      <div className={cl(classes.linkCardContainer)}>
        {homepageLink && homepageLinkText && (
          <LinkCard
            href={homepageLink?.href}
            icon="PieChart"
            headingText={homepageLinkText}
            size="small"
          ></LinkCard>
        )}

        <LinkCard
          href={definitionsLink.href}
          icon="Files"
          headingText={definitionsLinkText}
          size="small"
        ></LinkCard>
      </div>
    </div>
  );
}
