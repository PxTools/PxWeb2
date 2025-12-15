import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import Select from './Select';
import { SelectOption } from './SelectOptionType';
import { mockHTMLDialogElement } from '../../util/test-utils';

describe('Select', () => {
  const mockOptions: SelectOption[] = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ];

  const mockAddModal = vi.fn();
  const mockRemoveModal = vi.fn();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockHTMLDialogElement();
    vi.clearAllMocks();
  });

  describe('DefaultSelect variant', () => {
    it('should render with required props', () => {
      render(
        <Select
          label="Test Select"
          options={mockOptions}
          onChange={mockOnChange}
          addModal={mockAddModal}
          removeModal={mockRemoveModal}
        />,
      );

      expect(screen.getByText('Test Select')).toBeDefined();
    });

    it('should hide label when hideLabel is true', () => {
      const { container } = render(
        <Select
          label="Test Select"
          hideLabel={true}
          options={mockOptions}
          onChange={mockOnChange}
          addModal={mockAddModal}
          removeModal={mockRemoveModal}
        />,
      );

      const labelWrapper = container.querySelector('[class*="visuallyHidden"]');
      expect(labelWrapper).toBeDefined();
    });

    it('should display selected option when provided', async () => {
      render(
        <Select
          label="Test Select"
          options={mockOptions}
          selectedOption={mockOptions[0]}
          onChange={mockOnChange}
          addModal={mockAddModal}
          removeModal={mockRemoveModal}
        />,
      );

      const option = await screen.findByText(mockOptions[0].label);
      expect(option).toBeInTheDocument();
    });
   });

   it('should display selected option when provided', () => {
      render(
        <Select
          label="Test Select"
          options={mockOptions}
          selectedOption={mockOptions[0]}
          onChange={mockOnChange}
          addModal={mockAddModal}
          removeModal={mockRemoveModal}
        />,
      );

      const nativeSelect = screen.getByRole('combobox', { name: /test select/i });
      expect(nativeSelect).toHaveDisplayValue('Option 1');

      // Alternatively:
      // expect(screen.getByRole('option', { name: 'Option 1' })).toBeSelected();
    });

  describe('VariableBoxSelect variant', () => {
    const defaultProps = {
      label: 'Test Select',
      options: mockOptions,
      onChange: mockOnChange,
      addModal: mockAddModal,
      removeModal: mockRemoveModal,
      variant: 'inVariableBox' as const,
    };

    it('should render with required props', () => {
      render(<Select {...defaultProps} />);
      expect(screen.getByText('Test Select')).toBeDefined();
    });

    it('should register modal handlers on mount', () => {
      render(<Select {...defaultProps} />);

      const select = screen.getByRole('button');
      fireEvent.click(select);

      expect(mockAddModal).toHaveBeenCalledWith(
        'VariableBoxSelect',
        expect.any(Function),
      );
    });

    it('should remove modal handlers on unmount', () => {
      const { unmount } = render(<Select {...defaultProps} />);

      const select = screen.getByRole('button');
      fireEvent.click(select);
      unmount();

      expect(mockRemoveModal).toHaveBeenCalledWith('VariableBoxSelect');
    });

    it('should display selected option when provided', () => {
      render(<Select {...defaultProps} selectedOption={mockOptions[0]} />);

      expect(screen.getByText(mockOptions[0].label)).toBeDefined();
    });

    it('should display placeholder when no option is selected', () => {
      const placeholder = 'Select an option';
      render(<Select {...defaultProps} placeholder={placeholder} />);

      expect(screen.getByText(placeholder)).toBeDefined();
    });

    it('should handle spacebar interaction correctly', () => {
      render(<Select {...defaultProps} />);

      const select = screen.getByRole('button');

      // First press space (keydown)
      fireEvent.keyDown(select, { key: ' ' });

      // Then release space (keyup) which should open the modal
      fireEvent.keyUp(select, { key: ' ' });

      // Verify modal is opened
      expect(screen.getByRole('dialog')).toBeDefined();

      // Verify modal handler was registered
      expect(mockAddModal).toHaveBeenCalledWith(
        'VariableBoxSelect',
        expect.any(Function),
      );
    });

    it('should prevent scrolling on spacebar keydown', () => {
      // Spy on Event.prototype.preventDefault
      const preventDefaultSpy = vi.spyOn(Event.prototype, 'preventDefault');

      render(<Select {...defaultProps} />);

      const select = screen.getByRole('button');

      // Simulate the keyDown event as React would handle it
      fireEvent.keyDown(select, {
        key: ' ',
        code: 'Space',
        charCode: 32,
        keyCode: 32,
        bubbles: true,
        cancelable: true,
      });

      // Assert that preventDefault was called
      expect(preventDefaultSpy).toHaveBeenCalled();

      // Clean up the spy
      preventDefaultSpy.mockRestore();
    });

    it('should handle keyboard interaction for opening modal', () => {
      render(<Select {...defaultProps} />);

      const select = screen.getByRole('button');

      // Verify keyboard interaction opens modal
      fireEvent.keyUp(select, { key: ' ' });
      expect(screen.getByRole('dialog')).toBeDefined();
      expect(mockAddModal).toHaveBeenCalledWith(
        'VariableBoxSelect',
        expect.any(Function),
      );
    });

    it('should have correct ARIA attributes', () => {
      render(<Select {...defaultProps} />);

      const select = screen.getByRole('button');

      expect(select).toHaveAttribute('role', 'button');
      expect(select).toHaveAttribute('aria-haspopup', 'dialog');
    });
  });
});
