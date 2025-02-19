import cl from 'clsx';
import classes from './ContactTab.module.scss';
import { Contact, ContactComponent, MissingContact} from '@pxweb2/pxweb2-ui';

export type ContactTabProps = {
  readonly contacts: Contact[];
};

export function ContactTab({ contacts }: ContactTabProps) {
  if (!contacts || contacts.length === 0) {
    return <MissingContact />;
  }

  return (
    <div className={cl(classes.contactTab)}>
      {contacts.map((contact, index) => (
        <ContactComponent key={index} contact={contact} />
      ))}
    </div>
  );
}
