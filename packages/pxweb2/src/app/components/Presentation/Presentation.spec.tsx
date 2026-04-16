import { renderWithProviders } from '../../util/testing-utils';
import Presentation from './Presentation';

describe('Presentation', () => {
  // Setup console mocks before all tests
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    // Suppress React error logging and component console.log
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
  });

  afterAll(() => {
    // Restore console mocks
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <Presentation
        selectedTabId="1"
        isExpanded={false}
        setIsExpanded={vi.fn()}
      />,
    );

    expect(baseElement).toBeTruthy();
  });

  it('cleans up window resize listener on unmount', () => {
    const addEventListenerSpy = vi.spyOn(globalThis, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(globalThis, 'removeEventListener');

    const { unmount } = renderWithProviders(
      <Presentation
        selectedTabId="1"
        isExpanded={false}
        setIsExpanded={vi.fn()}
      />,
    );

    unmount();

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
