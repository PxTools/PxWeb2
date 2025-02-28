import { MutableRefObject } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import Search from './Search';
import classes from './Search.module.scss';

describe('Search component', () => {
  describe('rendering behavior', () => {
    it('applies correct classes for "default" variant', () => {
      const { container } = render(<Search />);
      const searchElement = container.firstChild as HTMLElement;
      const wrapperElement = searchElement.firstChild as HTMLElement;

      expect(searchElement).toHaveClass(classes.search);
      expect(searchElement).toHaveClass(classes.default);
      expect(wrapperElement).toHaveClass(classes.wrapper);
    });

    it('applies correct classes for "inVariableBox" variant', () => {
      const { container } = render(<Search variant="inVariableBox" />);
      const searchElement = container.firstChild as HTMLElement;
      const wrapperElement = searchElement.firstChild as HTMLElement;

      expect(searchElement).toHaveClass(classes.search);
      expect(searchElement).toHaveClass(classes.inVariableBox);
      expect(wrapperElement).toHaveClass(classes.wrapper);
    });

    it('applies the variableBoxTopBorderOverride class when specified', () => {
      const { container } = render(<Search variableBoxTopBorderOverride />);
      const wrapperElement = container.firstChild?.firstChild as HTMLElement;

      expect(wrapperElement).toHaveClass(
        classes.variableboxSearchAndSelectBorderOverride,
      );
    });

    it('displays the provided placeholder text', () => {
      const placeholderText = 'Search here...';
      const { getByPlaceholderText } = render(
        <Search searchPlaceHolder={placeholderText} />,
      );

      const input = getByPlaceholderText(placeholderText);

      expect(input).toBeInTheDocument();
    });

    it('sets aria labels on the icon and clear button', () => {
      const ariaLabelIconText = 'Search icon label';
      const arialLabelClearButtonText = 'Clear button label';
      const { getByLabelText } = render(
        <Search
          ariaLabelIconText={ariaLabelIconText}
          arialLabelClearButtonText={arialLabelClearButtonText}
          value="test"
        />,
      );

      expect(getByLabelText(ariaLabelIconText)).toBeInTheDocument();
      expect(getByLabelText(arialLabelClearButtonText)).toBeInTheDocument();
    });

    it('initializes the input with a provided value', () => {
      const initialValue = 'initial search value';
      const { getByRole } = render(<Search value={initialValue} />);
      const input = getByRole('textbox') as HTMLInputElement;

      expect(input.value).toBe(initialValue);
    });

    it('shows label text when "showLabel" is true', () => {
      const labelText = 'Search label';
      const { getByText } = render(<Search showLabel labelText={labelText} />);

      expect(getByText(labelText)).toBeInTheDocument();
    });

    it('passes additional props to the input element', () => {
      const dataTestId = 'search-input';
      const { getByTestId } = render(<Search data-testid={dataTestId} />);

      expect(getByTestId(dataTestId)).toBeInTheDocument();
    });
  });

  describe('interaction behavior', () => {
    it('clears input and refocuses when pressing Enter on the clear button', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { getByRole } = render(
        <Search
          onChange={handleChange}
          value="test"
          arialLabelClearButtonText="Clear button"
        />,
      );
      const input = getByRole('textbox');

      await user.tab(); // Focus the input
      await user.tab(); // Focus the clear button
      await user.keyboard('{Enter}');

      expect(handleChange).toHaveBeenCalledWith('');
      expect(document.activeElement).toBe(input);
    });

    it('clears input and refocuses when pressing Space on the clear button', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { getByRole } = render(
        <Search
          onChange={handleChange}
          value="test"
          arialLabelClearButtonText="Clear button"
        />,
      );
      const input = getByRole('textbox');

      await user.tab(); // Focus the input
      await user.tab(); // Focus the clear button
      await user.keyboard(' ');

      expect(handleChange).toHaveBeenCalledWith('');
      expect(document.activeElement).toBe(input);
    });

    it('clears input and refocuses upon clicking the clear button', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { getByRole } = render(
        <Search onChange={handleChange} value="test" />,
      );
      const input = getByRole('textbox');
      const button = getByRole('button');

      await user.click(button);

      expect(handleChange).toHaveBeenCalledWith('');
      expect(document.activeElement).toBe(input);
    });

    it('clears input and refocuses when pressing Escape with non-empty value', async () => {
      const handleChange = vi.fn();
      const { getByRole } = render(
        <Search onChange={handleChange} value="test" />,
      );
      const input = getByRole('textbox');

      fireEvent.keyDown(input, { key: 'Escape' });

      expect(handleChange).toHaveBeenCalledWith('');
      expect(document.activeElement).toBe(input);
    });

    it('does not call onChange when pressing Escape on empty input', async () => {
      const handleChange = vi.fn();
      const { getByRole } = render(<Search onChange={handleChange} value="" />);
      const input = getByRole('textbox');

      fireEvent.keyDown(input, { key: 'Escape' });

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('invokes onChange while typing', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { getByRole } = render(<Search onChange={handleChange} />);
      const input = getByRole('textbox');

      await user.type(input, 'hello');

      expect(handleChange).toHaveBeenCalledWith('h');
      expect(handleChange).toHaveBeenCalledWith('hello');
    });

    it('maintains external ref focus after clearing', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const ref = {
        current: null,
      } as MutableRefObject<HTMLInputElement | null>;
      const { getByRole } = render(
        <Search onChange={handleChange} value="test" ref={ref} />,
      );
      const input = getByRole('textbox');
      const button = getByRole('button');

      expect(ref.current).toBe(input);
      await user.click(button);

      expect(handleChange).toHaveBeenCalledWith('');
      expect(document.activeElement).toBe(input);
    });

    it('updates when value prop changes', () => {
      const { getByRole, rerender } = render(<Search value="initial" />);
      const input = getByRole('textbox') as HTMLInputElement;

      expect(input.value).toBe('initial');

      rerender(<Search value="updated" />);

      expect(input.value).toBe('updated');
    });
  });
});
