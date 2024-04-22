import { render } from '@testing-library/react';

import NavigationRail from './NavigationRail';

describe('Checkbox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <NavigationRail
        id="test"
        text="Variable 1"
        onChange={(val) => {
          console.log(val);
        }}
        value={true}
      />
    );
    expect(baseElement).toBeTruthy();
  });

  it('should check the checkbox', () => {
    let selected = false;

    const { baseElement } = render(
      <NavigationRail
        id="test"
        text="Variable 1"
        onChange={(val) => {
          selected = val;
          console.log('inside onchange');
        }}
        value={selected}
      />
    );

    baseElement.querySelector('#test').click();

    expect(selected).toBe(true);
  });
});
