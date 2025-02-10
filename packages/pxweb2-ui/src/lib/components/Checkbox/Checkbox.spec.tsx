import { render } from '@testing-library/react';

import Checkbox from './Checkbox';

describe('Checkbox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Checkbox
        id="test"
        text="Variable 1"
        onChange={(val) => {
          console.log(val);
        }}
        value={true}
      />,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should check the checkbox', () => {
    let selected = false;

    const { baseElement } = render(
      <Checkbox
        id="test"
        text="Variable 1"
        onChange={(val) => {
          selected = val;
        }}
        value={selected}
      />,
    );

    (baseElement.querySelector('#test') as HTMLElement)?.click();

    expect(selected).toBe(true);
  });
});
