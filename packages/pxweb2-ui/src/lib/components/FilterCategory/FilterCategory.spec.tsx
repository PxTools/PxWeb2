import { render } from '@testing-library/react';

import FilterCategory from './FilterCategory';

const checkboxItems = [
  {
    id: '1',
    text: 'Kvartal',
    value: false,
  },
  {
    id: '2',
    text: 'Måned',
    value: false,
  },
  {
    id: '3',
    text: 'År',
    value: false,
  },
];

describe('FilterCategory', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <FilterCategory heading="Frekvens" items={checkboxItems} />,
    );
    expect(baseElement).toBeTruthy();
  });
});
