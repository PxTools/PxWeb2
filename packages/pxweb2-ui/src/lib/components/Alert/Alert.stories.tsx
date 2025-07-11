import type { Meta, StoryFn } from '@storybook/react-vite';

import { Alert } from './Alert';
import { Link } from '../Link/Link';
import List from '../List/List';
import ListItem from '../List/ListItem';

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

export const WithLink: StoryFn<typeof Alert> = () => {
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

export const WithTextAndLink: StoryFn<typeof Alert> = () => {
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

export const WithOLList: StoryFn<typeof Alert> = () => {
  return (
    <Alert variant="info" heading="Heading alert" clickable closeButton>
      <List listType="ol" heading="Heading list">
        <ListItem>
          {' '}
          <Link href="wwww.ssb.no" inline>
            Se liste over endringene i de regionale inndelingene
          </Link>
        </ListItem>
        {/* <ListItem>note b</ListItem>
        <ListItem>note c</ListItem> */}
      </List>
    </Alert>
  );
};
export const WithULList: StoryFn<typeof Alert> = () => {
  return (
    <Alert variant="info" heading="Heading alert from notes" closeButton>
      <List listType="ul">
        <ListItem>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
          dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua
        </ListItem>
        <ListItem>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </ListItem>
        <li>Note c</li>
      </List>
    </Alert>
  );
};

export const WithULListClickable: StoryFn<typeof Alert> = () => {
  return (
    <Alert
      variant="info"
      heading="Heading Alert from notes"
      closeButton
      clickable
    >
      <List listType="ul">
        <ListItem>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
          dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua
        </ListItem>
        <ListItem>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </ListItem>
        <li>Note c</li>
      </List>
    </Alert>
  );
};

export const WithListgroupClickable: StoryFn<typeof Alert> = () => {
  return (
    <Alert variant="info" heading="Heading Alert" closeButton clickable>
      <List heading="Land" subHeading="Subheading" listType="ul" listGroup>
        <ListItem isVariableNote>
          <Link href="wwww.ssb.no" inline>
            Se liste over endringene i de regionale inndelingene
          </Link>
          <List subHeading="Palestina (2013-) (PS)" listType="ul">
            <ListItem>Tidligere: Vestbredden/Gazastripen (2001-2012)</ListItem>
            <ListItem>Vi later som denne har to</ListItem>
          </List>{' '}
        </ListItem>
        <ListItem isVariableNote>
          Variable note 2 very very long and maybe even longer.
        </ListItem>
        <ListItem isVariableNote>Variable note 3.</ListItem>
        <ListItem>
          <List subHeading="Belarus (BY)" listType="ul">
            <ListItem>Ble kalt Hviterussland fram til 2022.</ListItem>
          </List>
        </ListItem>
        <ListItem>
          <List subHeading="Eswatini (SZ)" listType="ul">
            <ListItem>Ble kalt Swaziland før 2018.</ListItem>
            <ListItem>Ble kalt Swaziland før 2018.</ListItem>
          </List>
        </ListItem>
        <ListItem>
          <List subHeading="Palestina (2013-) (PS)" listType="ul">
            <ListItem>Tidligere: Vestbredden/Gazastripen (2001-2012)</ListItem>
            <ListItem>Vi later som denne har to fotnoter</ListItem>
            <ListItem>Vi later som denne har tre fotnoter</ListItem>
            <ListItem>Vi later som denne har fire fotnoter</ListItem>
          </List>
        </ListItem>
      </List>
    </Alert>
  );
};

export const Test: StoryFn<typeof Alert> = () => {
  return (
    <Alert variant="info" heading="Heading Alert" closeButton clickable>
      <List listType="ul">
        <ListItem>
          <Link href="www.ssb.no">Gå til SSB</Link>
        </ListItem>
        <ListItem>
          <List heading="Land" subHeading="Subheading1" listType="ul" listGroup>
            <ListItem>Fotnote 11</ListItem>
            <ListItem>Fotnote 12</ListItem>
            <ListItem>Fotnote 13</ListItem>
            <ListItem>Fotnote 14</ListItem>
          </List>
          <List heading="Land" subHeading="Subheading2" listType="ul" listGroup>
            <ListItem>Fotnote 21</ListItem>
            <ListItem>Fotnote 22</ListItem>
            <ListItem>Fotnote 23</ListItem>
            <ListItem>Fotnote 24</ListItem>
          </List>
        </ListItem>
      </List>
    </Alert>
  );
};
