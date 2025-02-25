import cl from 'clsx';

import classes from './ContactTab.module.scss';
import { Contact, ContactComponent, MissingContact } from '@pxweb2/pxweb2-ui';

export type ContactTabProps = {
  readonly contacts: Contact[];
};

let number = 0;

function getContactKey(): string {
  return 'contact-' + number++;
}

export function ContactTab({ contacts }: ContactTabProps) {
  if (!contacts || contacts.length === 0) {
    return <MissingContact />;
  }

  return (
    <div className={cl(classes.contactTab)}>
      {contacts.map((contact) => (
        <ContactComponent key={getContactKey()} contact={contact} />
      ))}
    </div>
  );
}
