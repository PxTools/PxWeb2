import type { Meta, StoryFn } from '@storybook/react';

import { Alert } from './Alert';
import { Link } from '../Link/Link';
import List from '../List/List';

const meta: Meta<typeof Alert> = {
  component: Alert,
  title: 'Components/Alert',
  parameters: {
    layout: 'padded',
  },
};
export default meta;

export const Variant = {
  args: {
    variant: 'info',
    heading: 'Vi beklager',
    children:
      'Statistikkbanken er for øyeblikket nede. Vi jobber med feilen og forventer å være opp igjen i løpet av ei uke eller 2, beklager så mye',
    onClick: () => {
      alert(
        'Statistikkbanken er for øyeblikket nede. Vi jobber med feilen og forventer å være opp igjen i løpet av ei uke eller 2, beklager så mye ',
      );
    },
  },
};

export const withlink: StoryFn<typeof Alert> = () => {
  return (
    <>
      <br />
      <div style={{ width: '480px' }}>
        <Alert variant="info" closeButton>
          <Link href="https://www.ssb.no" inline>
            SSB
          </Link>
        </Alert>
      </div>
    </>
  );
};

export const withtextandlink: StoryFn<typeof Alert> = () => {
  return (
    <>
      <br />
      <div style={{ width: '480px' }}>
        <Alert variant="info" closeButton>
          Det finnes mer metadata om emnet. Dette kan du lese mer om her:{' '}
          <Link href="https://www.ssb.no" inline>
            SSB
          </Link>
        </Alert>
      </div>
    </>
  );
};

export const withOLList: StoryFn<typeof Alert> = () => {
  return (
    <Alert variant="info" heading="Hode" closeButton>
      <List listType="ol">
        <li>1</li>
        <li>2</li>
        <li>3</li>
      </List>
    </Alert>
  );
};
export const withULList: StoryFn<typeof Alert> = () => {
  return (
    <Alert variant="info" heading="Heading" closeButton>
      <List listType="ul">
        <li>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
          dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua
        </li>
        <li>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </li>
        <li>Note c</li>
      </List>
    </Alert>
  );
};

export const withULListClickable: StoryFn<typeof Alert> = () => {
  return (
    <Alert variant="info" heading="Heading" closeButton clickable>
      <List listType="ul">
        <li>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
          dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua
        </li>
        <li>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </li>
        <li>Note c</li>
      </List>
    </Alert>
  );
};
