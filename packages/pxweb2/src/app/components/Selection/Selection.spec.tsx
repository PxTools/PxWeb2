import { renderWithProviders } from '../../util/testing-utils';
import Selection from './Selection';

describe('Selection', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <Selection
        selectedNavigationView=""
        selectedTabId="1"
        setSelectedNavigationView={() => {}}
      />,
    );

    expect(baseElement).toBeTruthy();
  });
});
