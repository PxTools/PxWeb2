import { Meta, StoryObj } from '@storybook/react-vite';

import { ContactComponent } from './Contact';
import { Contact } from '@pxweb2/pxweb2-ui';

export default {
  title: 'Components/Contact',
  component: ContactComponent,
} as Meta;

type Story = StoryObj<typeof ContactComponent>;

export const Default: Story = {
  args: {
    contact: {
      name: 'John Doe',
      organization: 'Example Organization',
      mail: 'john.doe@example.com',
      phone: '123-456-7890',
      raw: 'This text wont be displayed',
    } as Contact,
  },
};

export const OnlyRaw: Story = {
  args: {
    contact: {
      name: '',
      organization: '',
      mail: '',
      phone: '',
      raw: 'Only raw contact information',
    } as Contact,
  },
};
