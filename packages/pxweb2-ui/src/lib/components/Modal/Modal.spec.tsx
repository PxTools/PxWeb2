import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

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

  it('should call onClose with correct parameters when clicking confirm button', () => {
    const onCloseMock = vi.fn();

    render(
      <Modal isOpen={true} onClose={onCloseMock}>
        <span>test</span>
      </Modal>,
    );

    const confirmButton = screen.getByText('common.generic_buttons.save');

    fireEvent.click(confirmButton);

    expect(onCloseMock).toHaveBeenCalledWith(true);
  });

  it('should call onClose with correct parameters when clicking cancel button', () => {
    const onCloseMock = vi.fn();

    render(
      <Modal isOpen={true} onClose={onCloseMock}>
        <span>test</span>
      </Modal>,
    );

    const cancelButton = screen.getByText('common.generic_buttons.cancel');

    fireEvent.click(cancelButton);

    expect(onCloseMock).toHaveBeenCalledWith(false);
  });

  it('should call onClose with correct parameters when clicking X button', () => {
    const onCloseMock = vi.fn();

    render(
      <Modal isOpen={true} onClose={onCloseMock}>
        <span>test</span>
      </Modal>,
    );

    // Get the X button specifically by finding it within the xMarkWrapper div
    const xButton = screen.getByLabelText('common.generic_buttons.cancel', {
      selector: `div[class*="xMarkWrapper"] button`,
    });

    fireEvent.click(xButton);

    expect(onCloseMock).toHaveBeenCalledWith(false);
  });

  it('should call onClose with correct parameters when pressing Escape', () => {
    const onCloseMock = vi.fn();

    render(
      <Modal isOpen={true} onClose={onCloseMock}>
        <span>test</span>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCloseMock).toHaveBeenCalledWith(false, 'Escape');
  });

  it('should render label and heading when provided', () => {
    render(
      <Modal isOpen={true} label="Test Label" heading="Test Heading">
        <span>test</span>
      </Modal>,
    );

    expect(screen.getByText('Test Label')).toBeDefined();
    expect(screen.getByText('Test Heading')).toBeDefined();
  });

  it('should handle Enter key press on buttons', () => {
    const onCloseMock = vi.fn();

    render(
      <Modal isOpen={true} onClose={onCloseMock}>
        <span>test</span>
      </Modal>,
    );

    const confirmButton = screen.getByText('common.generic_buttons.save');

    fireEvent.keyUp(confirmButton, { key: 'Enter' });

    expect(onCloseMock).toHaveBeenCalledWith(true, 'Enter');
  });

  it('should update body overflow style when opening and closing', () => {
    const { rerender } = render(
      <Modal isOpen={true}>
        <span>test</span>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false}>
        <span>test</span>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe('auto');
  });

  it('should apply custom className when provided', () => {
    const { container } = render(
      <Modal isOpen={true} className="custom-class">
        <span>test</span>
      </Modal>,
    );
    const dialog = container.querySelector('dialog');

    expect(dialog?.className).includes('custom-class');
  });
});
