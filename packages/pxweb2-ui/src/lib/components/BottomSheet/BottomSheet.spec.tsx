import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import BottomSheet from './BottomSheet';
import classes from './BottomSheet.module.scss';
import { mockHTMLDialogElement } from '../../util/test-utils';

describe('BottomSheet', () => {
  beforeEach(() => {
    mockHTMLDialogElement();
  });

  it('renders the BottomSheet with the correct heading and content', () => {
    render(
      <BottomSheet heading="Test Heading" isOpen={true}>
        <p>Test Content</p>
      </BottomSheet>,
    );

    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onCloseMock = vi.fn();
    render(
      <div id="test">
        <BottomSheet heading="Test Heading" isOpen={true} onClose={onCloseMock}>
          <p>Test Content</p>
        </BottomSheet>
      </div>,
    );

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    await waitFor(
      () => {
        expect(onCloseMock).toHaveBeenCalledTimes(1);
      },
      { timeout: 300 },
    );
  });

  it('closes the BottomSheet when clicking on the backdrop', async () => {
    const onCloseMock = vi.fn();
    render(
      <div data-testid="test">
        <BottomSheet heading="Test Heading" isOpen={true} onClose={onCloseMock}>
          <p>Test Content</p>
        </BottomSheet>
      </div>,
    );

    const dialog = document.querySelector('dialog') as HTMLElement;

    // Simulate a click on the backdrop
    fireEvent.click(dialog);

    await waitFor(
      () => {
        expect(onCloseMock).toHaveBeenCalledTimes(1);
      },
      { timeout: 300 },
    );
  });

  it('does not close the BottomSheet when clicking inside the content', () => {
    const onCloseMock = vi.fn();
    render(
      <BottomSheet heading="Test Heading" isOpen={true} onClose={onCloseMock}>
        <p>Test Content</p>
      </BottomSheet>,
    );

    const content = screen.getByText('Test Content');
    fireEvent.click(content);

    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it('closes the BottomSheet when the Escape key is pressed', async () => {
    const onCloseMock = vi.fn();
    render(
      <BottomSheet heading="Test Heading" isOpen={true} onClose={onCloseMock}>
        <p>Test Content</p>
      </BottomSheet>,
    );

    const dialog = document.querySelector('dialog') as HTMLElement;
    fireEvent.keyDown(dialog, { key: 'Escape' });

    await waitFor(
      () => {
        expect(onCloseMock).toHaveBeenCalledTimes(1);
      },
      { timeout: 300 },
    );
  });

  it('applies custom className when provided', () => {
    render(
      <BottomSheet
        heading="Test Heading"
        isOpen={true}
        className="custom-class"
      >
        <p>Test Content</p>
      </BottomSheet>,
    );

    const dialog = document.querySelector('dialog');
    expect(dialog).toHaveClass('custom-class');
  });

  it('applies correct animations classes', () => {
    render(
      <BottomSheet heading="Test Heading" isOpen={true}>
        <p>Test Content</p>
      </BottomSheet>,
    );

    const dialog = document.querySelector('dialog') as HTMLElement;

    expect(dialog).toHaveClass(classes.slidein);
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(dialog).toHaveClass(classes.slideout);
  });
});
