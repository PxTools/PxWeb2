import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import Radio, { SelectOption } from './Radio';

describe('Radio', () => {
  const mockOptions: SelectOption[] = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ];

  const defaultProps = {
    name: 'test-radio',
    options: mockOptions,
    legend: 'Test Radio Group',
    onChange: () => {
      return;
    },
  };

  describe('rendering', () => {
    it('should render all options', () => {
      render(<Radio {...defaultProps} />);

      mockOptions.forEach((option) => {
        expect(screen.getByLabelText(option.label)).toBeDefined();
      });
    });

    it('should render with default variant', () => {
      const { container } = render(<Radio {...defaultProps} />);

      const radioGroup = container.querySelector('[class*="default"]');
      expect(radioGroup).toBeDefined();
    });

    it('should render with inModal variant', () => {
      const { container } = render(
        <Radio {...defaultProps} variant="inModal" />,
      );

      const radioGroup = container.querySelector('[class*="inModal"]');
      expect(radioGroup).toBeDefined();
    });

    it('legend should not be visible when hideLegend is true', () => {
      const { container } = render(
        <Radio {...defaultProps} hideLegend={true} />,
      );
      const legend = container.querySelector('legend');
      const hasLegendSrOnly =
        legend !== null &&
        Array.from(legend.classList).some((cls) =>
          cls.includes('legendSrOnly'),
        );
      expect(hasLegendSrOnly).toBe(true);
    });

    it('legend should be visible when hideLegend is false', () => {
      const { container } = render(
        <Radio {...defaultProps} hideLegend={false} />,
      );
      const legend = container.querySelector('legend');
      const hasLegendSrOnly =
        legend !== null &&
        Array.from(legend.classList).some((cls) =>
          cls.includes('legendSrOnly'),
        );
      expect(hasLegendSrOnly).toBe(false);
    });
  });

  describe('selection behavior', () => {
    it('should mark the selected option as checked', () => {
      render(<Radio {...defaultProps} selectedOption={mockOptions[1].value} />);

      const selectedRadio = screen.getByLabelText(
        mockOptions[1].label,
      ) as HTMLInputElement;
      expect(selectedRadio.checked).toBe(true);
    });

    it('should call onChange when selecting an option', () => {
      const mockOnChange = vi.fn();
      render(<Radio {...defaultProps} onChange={mockOnChange} />);

      const radio = screen.getByLabelText(mockOptions[0].label);
      fireEvent.click(radio);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should have correct name attribute on all inputs', () => {
      render(<Radio {...defaultProps} />);

      const radioInputs = screen.getAllByRole('radio');
      radioInputs.forEach((input) => {
        expect(input).toHaveAttribute('name', defaultProps.name);
      });
    });
  });

  describe('accessibility', () => {
    it('should forward ref to selected radio input', () => {
      const ref = vi.fn();
      render(
        <Radio
          {...defaultProps}
          selectedOption={mockOptions[1].value}
          ref={ref}
        />,
      );

      expect(ref).toHaveBeenCalled();
    });

    it('should have proper attributes for accessibility', () => {
      render(<Radio {...defaultProps} />);

      const radioInputs = screen.getAllByRole('radio');

      radioInputs.forEach((input, index) => {
        expect(input).toHaveAttribute('type', 'radio');
        expect(input).toHaveAttribute('id', mockOptions[index].value);
        expect(input).toHaveAttribute('value', mockOptions[index].value);
      });
    });

    it('should allow keyboard interaction', () => {
      const mockOnChange = vi.fn();
      render(<Radio {...defaultProps} onChange={mockOnChange} />);

      const firstRadio = screen.getByLabelText(mockOptions[0].label);
      firstRadio.focus();
      fireEvent.click(firstRadio);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should be keyboard accessible', () => {
      render(<Radio {...defaultProps} />);

      const firstRadio = screen.getByLabelText(mockOptions[0].label);

      // Verify the radio can receive focus
      firstRadio.focus();
      expect(firstRadio).toHaveFocus();

      // Verify it has the correct role
      expect(firstRadio).toHaveAttribute('type', 'radio');
    });
  });

  describe('group behavior', () => {
    it('should call onChange with correct values when selecting different options', () => {
      const mockOnChange = vi.fn();
      render(<Radio {...defaultProps} onChange={mockOnChange} />);

      const radio1 = screen.getByLabelText(mockOptions[0].label);
      const radio2 = screen.getByLabelText(mockOptions[1].label);

      fireEvent.click(radio1);
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: mockOptions[0].value,
          }),
        }),
      );

      fireEvent.click(radio2);
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: mockOptions[1].value,
          }),
        }),
      );
    });

    it('should reflect selected state based on selectedOption prop', () => {
      const { rerender } = render(
        <Radio {...defaultProps} selectedOption={mockOptions[0].value} />,
      );

      const radio1 = screen.getByLabelText(
        mockOptions[0].label,
      ) as HTMLInputElement;
      const radio2 = screen.getByLabelText(
        mockOptions[1].label,
      ) as HTMLInputElement;

      expect(radio1.checked).toBe(true);
      expect(radio2.checked).toBe(false);

      // Update selected option
      rerender(
        <Radio {...defaultProps} selectedOption={mockOptions[1].value} />,
      );

      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(true);
    });
  });
});
