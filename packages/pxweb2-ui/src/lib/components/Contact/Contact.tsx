import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './Contact.module.scss';
import { Heading, Icon, BodyLong, Link, Contact } from '@pxweb2/pxweb2-ui';

export type ContactProps = {
  readonly contact: Contact;
};

export function ContactComponent({ contact }: ContactProps) {
  const displayRaw =
    contact.raw &&
    !contact.name &&
    !contact.mail &&
    !contact.phone &&
    !contact.organization;

  return (
    <div className={cl(classes.contact)}>
      <Heading level="3" size="small" spacing={true}>
        {contact.name}
      </Heading>
      {contact.organization && (
        <div className={classes.contactItem}>
          <BodyLong>{contact.organization}</BodyLong>
        </div>
      )}
      {contact.mail && (
        <div className={classes.contactItem}>
          <Icon iconName="EnvelopeClosed" />
          <Link inline={true} href={`mailto:${contact.mail}`}>
            {contact.mail}
          </Link>
        </div>
      )}
      {contact.phone && (
        <div className={classes.contactItem}>
          <Icon iconName="Phone" />
          <Link inline={true} href={`tel:${contact.phone}`}>
            {contact.phone}
          </Link>
        </div>
      )}
      {displayRaw && (
        <div className={classes.contactItem}>
          <BodyLong>{contact.raw}</BodyLong>
        </div>
      )}
    </div>
  );
}

export function MissingContact() {
  const { t } = useTranslation();
  return (
    <div className={cl(classes.contact)}>
      <Heading level="3" size="small" spacing={true}>
        {t(
          'presentation_page.main_content.about_table.contact.missing_heading',
        )}
      </Heading>
      <BodyLong>
        {t('presentation_page.main_content.about_table.contact.missing_text')}
      </BodyLong>
    </div>
  );
}
