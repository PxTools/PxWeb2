import { render } from '@testing-library/react';
import { ContactComponent, MissingContact } from './Contact';
import { Contact } from '@pxweb2/pxweb2-ui';

describe('ContactComponent', () => {
    const contact: Contact = {
        name: 'John Doe',
        org: 'Organization',
        phone: '123456789',
        mail: 'john.doe@example.com',
        freeText: 'Some free text',
    };

    it('should render successfully', () => {
        const { baseElement } = render(<ContactComponent contact={contact} />);
        expect(baseElement).toBeTruthy();
    });

    it('should render contact name', () => {
        const { getByText } = render(<ContactComponent contact={contact} />);
        expect(getByText('John Doe')).toBeTruthy();
    });

    it('should render contact organization', () => {
        const { getByText } = render(<ContactComponent contact={contact} />);
        expect(getByText('Organization')).toBeTruthy();
    });

    it('should render contact phone', () => {
        const { getByText } = render(<ContactComponent contact={contact} />);
        expect(getByText('123456789')).toBeTruthy();
    });

    it('should render contact email', () => {
        const { getByText } = render(<ContactComponent contact={contact} />);
        expect(getByText('john.doe@example.com')).toBeTruthy();
    });

    it('should render contact free text', () => {
        const { getByText } = render(<ContactComponent contact={contact} />);
        expect(getByText('Some free text')).toBeTruthy();
    });
});

describe('MissingContact', () => {
    it('should render missing contact message', () => {
        const { getByText } = render(<MissingContact />);
        expect(getByText('presentation_page.main_content.about_table.contact.missing_heading')).toBeTruthy();
        expect(getByText('presentation_page.main_content.about_table.contact.missing_text')).toBeTruthy();
    });
});