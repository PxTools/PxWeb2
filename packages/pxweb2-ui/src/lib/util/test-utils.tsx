// Mock for showModal and close
const mockHTMLDialogElement = () => {
  if (!window.HTMLDialogElement.prototype.showModal) {
    window.HTMLDialogElement.prototype.showModal = function () {
      this.style.display = 'block';
    };
  }

  if (!window.HTMLDialogElement.prototype.close) {
    window.HTMLDialogElement.prototype.close = function () {
      this.style.display = 'none';
    };
  }
};

// Helper to wrap test execution with fast timers
const withFastTimers = (testFn: () => void) => {
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = ((callback: () => void, delay?: number) => {
    if (delay === 280) {
      callback();
      return 0 as unknown as NodeJS.Timeout;
    }
    return originalSetTimeout(callback, delay);
  }) as typeof setTimeout;

  try {
    testFn();
  } finally {
    window.setTimeout = originalSetTimeout;
  }
};

export { mockHTMLDialogElement, withFastTimers };
