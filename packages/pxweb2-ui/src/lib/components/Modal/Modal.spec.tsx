import { render } from '@testing-library/react';

import Modal from './Modal';
import { mockHTMLDialogElement } from '../../util/test-utils';

describe('Modal', () => {
  beforeEach(() => {
    mockHTMLDialogElement();
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <Modal isOpen={true}>
        <span>test</span>
      </Modal>,
    );

    expect(baseElement).toBeTruthy();
  });

  it('should render 3 buttons', () => {
    const { baseElement } = render(
      <Modal isOpen={true}>
        <span>test</span>
      </Modal>,
    );

    const buttons = baseElement.getElementsByTagName('button');
    const buttonsLength = buttons.length;

    expect(buttonsLength).toBe(3);
  });

  it('should render the default button translations', () => {
    const { baseElement } = render(
      <Modal isOpen={true}>
        <span>test</span>
      </Modal>,
    );

    // Modal has 3 buttons, and the second and third have the text content
    const buttons = baseElement.getElementsByTagName('button');
    const saveButton = buttons.item(1);
    const cancelButton = buttons.item(2);

    expect(saveButton?.textContent).toBe('common.generic_buttons.save');
    expect(cancelButton?.textContent).toBe('common.generic_buttons.cancel');
  });

  it('should render the custom button translations', () => {
    const { baseElement } = render(
      <Modal
        isOpen={true}
        confirmLabel="custom.confirm"
        cancelLabel="custom.cancel"
      >
        <span>test</span>
      </Modal>,
    );

    // Modal has 3 buttons, and the second and third have the text content
    const buttons = baseElement.getElementsByTagName('button');
    const saveButton = buttons.item(1);
    const cancelButton = buttons.item(2);

    expect(saveButton?.textContent).toBe('custom.confirm');
    expect(cancelButton?.textContent).toBe('custom.cancel');
  });
});
