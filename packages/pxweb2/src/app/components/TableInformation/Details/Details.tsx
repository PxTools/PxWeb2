import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './Details.module.scss';
import { Heading, Icon, IconProps, BodyShort } from '@pxweb2/pxweb2-ui';
import { ContentDetails } from './utils';

export type DetailsProps = {
  readonly heading: string;
  readonly icon: IconProps['iconName'];
  readonly type?: 'text' | 'boolean';
  readonly value?: string | boolean;
  readonly children?: ContentDetails[];
};

export function Details({
  heading,
  icon,
  type = 'text',
  value,
  children,
}: DetailsProps) {
  const { t } = useTranslation();
  return (
    <div className={cl(classes.detail)}>
      <div className={cl(classes.iconWrapper)}>
        <Icon iconName={icon} />
      </div>
      <div className={cl(classes.textContainer)}>
        <Heading level="3" spacing={true} size="small">
          {heading}
        </Heading>
        {type === 'text' && !children && <BodyShort>{value}</BodyShort>}
        {type === 'boolean' && (
          <BodyShort>
            {value
              ? t(
                  'presentation_page.main_content.about_table.details.boolean_true',
                )
              : t(
                  'presentation_page.main_content.about_table.details.boolean_false',
                )}
          </BodyShort>
        )}
        {children?.map((content, index) => (
          <div className={cl(classes.contentDetail)} key={content.subHeading}>
            <Heading level="4" spacing={true} size="xsmall">
              {content.subHeading}
            </Heading>
            <BodyShort spacing={index !== children.length - 1}>
              {content.text}
            </BodyShort>
          </div>
        ))}
      </div>
    </div>
  );
}
