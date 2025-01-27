import { renderWithProviders } from '../../util/testing-utils';
import Presentation from './Presentation';

describe('Presentation', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <Presentation selectedTabId="1" />,
    );

    expect(baseElement).toBeTruthy();
  });
});
