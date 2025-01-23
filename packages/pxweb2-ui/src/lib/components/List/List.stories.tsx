import React from 'react';
import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import List from './List';
import ListItem from './ListItem';

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
        <ListItem>Item1</ListItem>
        <ListItem>Item2</ListItem>
        <ListItem>Item3</ListItem>
        <ListItem>Item4</ListItem>
      </List>

      <h1>Heading snd subheading Ordered list</h1>

      <List subHeading="List subheading" listType="ol">
        <ListItem>Item1</ListItem>
        <ListItem>Item2</ListItem>
        <ListItem>Item3</ListItem>
        <ListItem>Item4</ListItem>
      </List>
    </>
  );
};
