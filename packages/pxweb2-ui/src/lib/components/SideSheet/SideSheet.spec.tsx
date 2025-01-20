import { render } from '@testing-library/react';

import SideSheet from './SideSheet';

describe('SideSheet', () => {
  beforeEach(() => {
    // Mock for showModal and close
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
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <SideSheet
        isOpen={true}
        heading="test"
        onClose={() => {
          console.log('close');
        }}
      >
        <span>test</span>
      </SideSheet>,
    );
    expect(baseElement).toBeTruthy();
  });
});
