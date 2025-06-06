import { getByText, render } from '@testing-library/react';

import NavigationBar from './NavigationBar';

describe('NavigationBar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <NavigationBar
        selected="selection"
        onChange={() => {
          return;
        }}
      />,
    );
    const navbar = baseElement;

    expect(navbar).toBeTruthy();
  });

  it('should render the text successfully', () => {
    const { baseElement } = render(
      <NavigationBar
        selected="selection"
        onChange={() => {
          return;
        }}
      />,
    );
    const navbar = baseElement;

    expect(
      getByText(navbar, 'presentation_page.sidemenu.selection.title'),
    ).toBeTruthy();
  });

  it('should render all menu items', () => {
    const { baseElement } = render(
      <NavigationBar
        selected="selection"
        onChange={() => {
          return;
        }}
      />,
    );
    const navbar = baseElement;
    expect(
      getByText(navbar, 'presentation_page.sidemenu.selection.title'),
    ).toBeTruthy();
    expect(
      getByText(navbar, 'presentation_page.sidemenu.view.title'),
    ).toBeTruthy();
    expect(
      getByText(navbar, 'presentation_page.sidemenu.edit.title'),
    ).toBeTruthy();
    expect(
      getByText(navbar, 'presentation_page.sidemenu.save.title'),
    ).toBeTruthy();
    expect(
      getByText(navbar, 'presentation_page.sidemenu.help.title'),
    ).toBeTruthy();
  });

  it('should render the selected item', () => {
    const { baseElement } = render(
      <NavigationBar
        selected="selection"
        onChange={() => {
          return;
        }}
      />,
    );

    const navbar = baseElement;
    // This relies on the CSS class name being the first one on the element, which is not ideal.
    // But since CSS class names are generated with a hash, it's the best we can do without changing how we style components
    const selectionButton = navbar.querySelector(`[class^="_selected"]`);

    // Since i18n is used in a test, it returns the translation key instead of the actual text
    expect(
      getByText(
        selectionButton as HTMLElement,
        'presentation_page.sidemenu.selection.title',
      ),
    ).toBeTruthy();
  });

  it('should render an SVG', () => {
    const { baseElement } = render(
      <NavigationBar
        selected="selection"
        onChange={() => {
          return;
        }}
      />,
    );
    const navbar = baseElement;
    const svg = navbar.querySelector('svg');

    expect(svg).toBeTruthy();
  });
});
