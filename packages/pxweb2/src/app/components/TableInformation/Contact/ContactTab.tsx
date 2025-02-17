import cl from 'clsx';
import classes from './Contact.module.scss';
import { Contact} from '@pxweb2/pxweb2-ui';
import { ContactComponent, MissingContact } from './Contact';

export type ContactTabProps = {
  readonly contacts: Contact[];
};

export function ContactTab({ contacts }: ContactTabProps) {
  if (!contacts || contacts.length === 0) {
    return <MissingContact />;
  }

  return (
    <div className={cl(classes.contactTab)}>
      {contacts.map((contact) => (
        <ContactComponent contact={contact} />
      ))}
    </div>
  );
}
