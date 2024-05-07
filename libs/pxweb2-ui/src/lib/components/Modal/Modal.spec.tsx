import { render } from '@testing-library/react';
import Modal from './Modal';

describe('Modal', () => {
  it('should render successfully', () => {
    
    // Mock for showModal and close
    if (!window.HTMLDialogElement.prototype.showModal) {
      window.HTMLDialogElement.prototype.showModal = function() {
        this.style.display = "block";
      };
    }
    
    if (!window.HTMLDialogElement.prototype.close) {
      window.HTMLDialogElement.prototype.close = function() {
        this.style.display = "none";
      };
    }

    const { baseElement } = render(
      <Modal isOpen={true}>
        <span>test</span>
      </Modal>
    );
    expect(baseElement).toBeTruthy();

  });


});
