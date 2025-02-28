import { render } from '@testing-library/react';

import List from './List';

describe('List Component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <List listType="ul">
        <li>Item 1</li>
        <li>Item 2</li>
      </List>,
    );
    expect(container).toBeDefined();
  });

  it('renders heading when provided', () => {
    const { getByText } = render(
      <List heading="Test Heading" listType="ul">
        <li>Item 1</li>
        <li>Item 2</li>
      </List>,
    );
    expect(getByText('Test Heading')).toBeTruthy();
  });

  it('renders subHeading when provided and listGroup is false', () => {
    const { getByText } = render(
      <List subHeading="Test SubHeading" listType="ul">
        <li>Item 1</li>
        <li>Item 2</li>
      </List>,
    );
    expect(getByText('Test SubHeading')).toBeTruthy();
  });

  it('does not render subHeading when listGroup is true', () => {
    const { queryByText } = render(
      <List subHeading="Test SubHeading" listGroup listType="ul">
        <li>Item 1</li>
        <li>Item 2</li>
      </List>,
    );
    expect(queryByText('Test SubHeading')).toBeNull();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <List listType="ul">
        <li>Item 1</li>
        <li>Item 2</li>
      </List>,
    );
    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('renders with correct list type', () => {
    const { container } = render(
      <List listType="ol">
        <li>Item 1</li>
        <li>Item 2</li>
      </List>,
    );
    expect(container.querySelector('ol')).toBeTruthy();
  });

  it('does not render heading and subHeading when nested is true', () => {
    const { queryByText } = render(
      <List
        heading="Test Heading"
        subHeading="Test SubHeading"
        nested
        listType="ul"
      >
        <li>Item 1</li>
        <li>Item 2</li>
      </List>,
    );
    expect(queryByText('Test Heading')).toBeNull();
    expect(queryByText('Test SubHeading')).toBeNull();
  });
});
