import React from 'react';
import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import List from './List';
import ListItem from './ListItem';
import Link from '../Link/Link';

const meta: Meta<typeof List> = {
  component: List,
  title: 'Components/List',
};
export default meta;

type Story = StoryObj<typeof List>;
export const variants: Story = {
  args: {
    heading: 'List heading',
    subHeading: 'List subheading',
    listType: 'ul',
    children: <ListItem>Item1</ListItem>,
  },
};

export const OrdereAndUnordered: StoryFn<typeof List> = () => {
  return (
    <>
      <h1>Heading and subheading Unordered list</h1>

      <List heading="List heading" subHeading="List subheading" listType="ul">
        <ListItem>Item1 long long long long and longer</ListItem>
        <ListItem>Item2</ListItem>
        <ListItem>Item3</ListItem>
        <ListItem>Item4</ListItem>
      </List>

      <h1>Heading and subheading Ordered list</h1>

      <List subHeading="List subheading" listType="ol">
        <ListItem>Item1</ListItem>
        <ListItem>Item2</ListItem>
        <ListItem>Item3</ListItem>
        <ListItem>
          Item4 <Link href="wwww.ssb.no">testlenke </Link>
        </ListItem>
        <ListItem>
          <Link href="wwww.ssb.no">testlenke 2 </Link>
        </ListItem>
      </List>

      <h1>Nested list</h1>

      <List heading="Heading" listType="ul">
        <ListItem>
          item1
          <List listType="ul" listSubType="nested">
            <ListItem>Nested item1.1</ListItem>
            <ListItem>Nested item1.2</ListItem>
            <ListItem>Nested item1.3</ListItem>
          </List>
        </ListItem>
        <ListItem>item2</ListItem>
        <List listType="ol" listSubType="nested">
          <ListItem>Nested item2.1</ListItem>
          <ListItem>Nested item2.2</ListItem>
          <ListItem>Nested item2.3</ListItem>
        </List>
        <ListItem>item3</ListItem>
      </List>

      <h1>Listgroup</h1>

      <List heading="Land" listType="ul" listSubType="listgroup">
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
