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

  // it('should render the selected item', () => {
  //   const { baseElement } = render(
  //     <NavigationRail
  //       selected="filter"
  //       onChange={() => {
  //         return;
  //       }}
  //     />
  //   );

  //   // Since i18n is used in a test, it returns the translation key instead of the actual text
  //   const filterButton = baseElement.querySelector(`[id^="px-navRail-presentation_page.sidemenu.selection.title"]`);

  //   // This relies on the CSS class name being the first one on the element, which is not ideal.
  //   // But since CSS class names are generated with a hash, it's the best we can do without changing how we style components
  //   const isSelected = filterButton?.querySelector(`[class^="_selected"]`);

  //   expect(isSelected).toBeTruthy();
  // });

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
