import { getByText, render } from '@testing-library/react';

import NavigationRail from './NavigationRail';

describe('NavigationRail', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <NavigationRail
        selected="filter"
        onChange={() => {
          return;
        }}
      />
    );

    expect(baseElement).toBeTruthy();
  });

  it('should render the text successfully', () => {
    const { baseElement } = render(
      <NavigationRail
        selected="filter"
        onChange={() => {
          return;
        }}
      />
    );

    expect(
      getByText(baseElement, 'presentation_page.sidemenu.selection.title')
    ).toBeTruthy();
  });

  it('should render all menu items', () => {
    const { baseElement } = render(
      <NavigationRail
        selected="filter"
        onChange={() => {
          return;
        }}
      />
    );

    expect(
      getByText(baseElement, 'presentation_page.sidemenu.selection.title')
    ).toBeTruthy();
    expect(
      getByText(baseElement, 'presentation_page.sidemenu.view.title')
    ).toBeTruthy();
    expect(
      getByText(baseElement, 'presentation_page.sidemenu.edit.title')
    ).toBeTruthy();
    expect(
      getByText(baseElement, 'presentation_page.sidemenu.save.title')
    ).toBeTruthy();
    expect(
      getByText(baseElement, 'presentation_page.sidemenu.help.title')
    ).toBeTruthy();
  });

  it('should render the selected item', () => {
    // const { baseElement } = render(
    //   <NavigationRail
    //     selected="filter"
    //     onChange={() => {
    //       return;
    //     }}
    //   />
    // );
    // TODO: Fix this test

    // const selected = baseElement.querySelector('.selected');

    // expect(selected).toBeTruthy();
  });

  it('should render an SVG', () => {
    const { baseElement } = render(
      <NavigationRail
        selected="filter"
        onChange={() => {
          return;
        }}
      />
    );

    const svg = baseElement.querySelector('svg');

    expect(svg).toBeTruthy();
  });
});
