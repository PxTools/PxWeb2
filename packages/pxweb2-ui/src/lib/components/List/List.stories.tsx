import type { Meta, StoryFn } from '@storybook/react-vite';

import List from './List';
import ListItem from './ListItem';
import Link from '../Link/Link';

const meta: Meta<typeof List> = {
  component: List,
  title: 'Components/List',
};
export default meta;

export const OrderedAndUnordered: StoryFn<typeof List> = () => {
  return (
    <>
      <h1>
        <i>Heading and subheading Unordered list</i>
      </h1>

      <List heading="Heading" subHeading="Subheading" listType="ul">
        <ListItem>Item1 long long long long and longer</ListItem>
        <ListItem>Item2</ListItem>
        <ListItem>Item3</ListItem>
        <ListItem>Item4</ListItem>
      </List>

      <h1>
        <i>Heading and subheading Ordered list</i>
      </h1>

      <List heading="Heading" subHeading="Subheading" listType="ol">
        <ListItem>Item1</ListItem>
        <ListItem>Item2</ListItem>
        <ListItem>Item3</ListItem>
        <ListItem>
          Item4{' '}
          <Link href="wwww.ssb.no" inline>
            testlenke{' '}
          </Link>
        </ListItem>
      </List>

      <h1>
        <i>Heading only Unordered list</i>
      </h1>

      <List heading="Heading" listType="ul">
        <ListItem>Item1 long long long long and longer</ListItem>
        <ListItem>Item2</ListItem>
        <ListItem>Item3</ListItem>
        <ListItem>Item4</ListItem>
      </List>

      <h1>
        <i>Heading only Ordered list</i>
      </h1>

      <List heading="Heading" listType="ol">
        <ListItem>Item1</ListItem>
        <ListItem>Item2</ListItem>
        <ListItem>Item3</ListItem>
        <ListItem>
          Item4{' '}
          <Link href="wwww.ssb.no" inline>
            testlenke{' '}
          </Link>
        </ListItem>
      </List>

      <h1>
        <i>Nested unordered list </i>{' '}
      </h1>

      <List heading="Heading" listType="ul">
        <ListItem>
          item1
          <List listType="ul" nested>
            <ListItem>Nested item1.1</ListItem>
            <ListItem>Nested item1.2</ListItem>
            <ListItem>Nested item1.3</ListItem>
          </List>
        </ListItem>
        <ListItem>
          item2
          <List listType="ol" nested>
            <ListItem>Nested item2.1</ListItem>
            <ListItem>Nested item2.2</ListItem>
            <ListItem>Nested item2.3</ListItem>
          </List>
        </ListItem>
        <ListItem>item3</ListItem>
      </List>

      <h1>
        <i>Nested ordered list</i>
      </h1>

      <List heading="Heading" listType="ol">
        <ListItem>
          item1
          <List
            listType="ol"
            heading="skal ikke vises"
            subHeading="skal ikke vises"
            nested
          >
            <ListItem>Nested item1.1</ListItem>
            <ListItem>Nested item1.2</ListItem>
            <ListItem>Nested item1.3</ListItem>
          </List>
        </ListItem>
        <ListItem>
          item2
          <List listType="ul" nested>
            <ListItem>Nested item2.1</ListItem>
            <ListItem>Nested item2.2</ListItem>
            <ListItem>Nested item2.3</ListItem>
          </List>
        </ListItem>
        <ListItem>
          item3
          <List listType="ol">
            <ListItem>Nested item3.1</ListItem>
            <ListItem>Nested item3.2</ListItem>
            <ListItem>Nested item3.3</ListItem>
          </List>
        </ListItem>
      </List>

      <h1>
        <i>Listgroup</i>
      </h1>

      <List heading="Land" subHeading="skal ikke vises" listType="ul" listGroup>
        <ListItem>
          <List subHeading="Belarus (BY)" listType="ul">
            <ListItem>Ble kalt Hviterussland fram til 2022.</ListItem>
          </List>
        </ListItem>
        <ListItem>
          <List subHeading="Eswatini (SZ)" listType="ul">
            <ListItem>Ble kalt Swaziland før 2018.</ListItem>
          </List>
        </ListItem>
        <ListItem>
          <List subHeading="Palestina (2013-) (PS)" listType="ul">
            <ListItem>Tidligere: Vestbredden/Gazastripen (2001-2012)</ListItem>
            <ListItem>Vi later som denne har to</ListItem>
          </List>
        </ListItem>
      </List>

      <h1>
        <i>Listgroup with listitem on variable level</i>
      </h1>
      <List heading="Land" subHeading="skal ikke vises" listType="ul" listGroup>
        <ListItem isVariableNote>
          {' '}
          <Link href="wwww.ssb.no" inline>
            Se liste over endringene i de regionale inndelingene
          </Link>
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
          </List>
        </ListItem>
        <ListItem>
          <List subHeading="Palestina (2013-) (PS)" listType="ul">
            <ListItem>Tidligere: Vestbredden/Gazastripen (2001-2012)</ListItem>
            <ListItem>Vi later som denne har to</ListItem>
          </List>
        </ListItem>
      </List>
    </>
  );
};
