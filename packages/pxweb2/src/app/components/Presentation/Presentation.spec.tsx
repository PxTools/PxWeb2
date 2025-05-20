import { renderWithProviders } from '../../util/testing-utils';
import Presentation from './Presentation';

describe('Presentation', () => {
  // Setup console mocks before all tests
  let consoleErrorSpy: any;
  let consoleLogSpy: any;

  beforeAll(() => {
    // Suppress React error logging and component console.log
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore console mocks
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <Presentation selectedTabId="1" />,
    );

    expect(baseElement).toBeTruthy();
  });
});
