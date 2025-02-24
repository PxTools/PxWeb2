import { render } from '@testing-library/react';

import { ContactComponent, MissingContact } from './Contact';
import { Contact } from '@pxweb2/pxweb2-ui';

describe('ContactComponent', () => {
  it('should display contact.raw if all other properties are undefined', () => {
    const contact: Contact = {
      name: '',
      organization: '',
      mail: '',
      phone: '',
      raw: 'Raw contact information',
    };

    const { getByText } = render(<ContactComponent contact={contact} />);

    expect(getByText('Raw contact information')).toBeTruthy();
  });

  it('should not display contact.raw if any other property is defined', () => {
    const contact: Contact = {
      name: 'John Doe',
      organization: '',
      mail: '',
      phone: '',
      raw: 'Raw contact information',
    };

    const { queryByText } = render(<ContactComponent contact={contact} />);

    expect(queryByText('Raw contact information')).toBeFalsy();
  });

  it('should display other contact properties if they are defined', () => {
    const contact: Contact = {
      name: 'John Doe',
      organization: 'Organization',
      mail: 'john.doe@example.com',
      phone: '123-456-7890',
      raw: 'Raw contact information',
    };

    const { getByText, queryByText } = render(
      <ContactComponent contact={contact} />,
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Organization')).toBeTruthy();
    expect(getByText('john.doe@example.com')).toBeTruthy();
    expect(getByText('123-456-7890')).toBeTruthy();
    expect(queryByText('Raw contact information')).toBeFalsy();
  });
});

describe('MissingContact', () => {
  it('should render missing contact message', () => {
    const { getByText } = render(<MissingContact />);
    expect(
      getByText(
        'presentation_page.main_content.about_table.contact.missing_heading',
      ),
    ).toBeTruthy();
    expect(
      getByText(
        'presentation_page.main_content.about_table.contact.missing_text',
      ),
    ).toBeTruthy();
  });
});
