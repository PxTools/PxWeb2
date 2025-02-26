import { MutableRefObject } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Search from './Search';
import classes from './Search.module.scss';

describe('Search', () => {
  describe('rendering behaviour', () => {
    it('applies "default" variant classes', () => {
      const { container } = render(<Search />);

      expect(container.firstChild).toHaveClass(classes.default);
      expect(container.firstChild?.firstChild).toHaveClass(classes.wrapper);
    });

    it('applies "inVariableBox" variant classes', () => {
      const { container } = render(<Search variant="inVariableBox" />);

      expect(container.firstChild).toHaveClass(classes.inVariableBox);
      expect(container.firstChild?.firstChild).toHaveClass(classes.wrapper);
    });

    it('displays the provided placeholder text', () => {
      const placeholderText = 'Search here...';
      const { getByPlaceholderText } = render(
        <Search searchPlaceHolder={placeholderText} />,
      );

      expect(getByPlaceholderText(placeholderText)).toBeInTheDocument();
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
      const { getByText } = render(
        <Search showLabel labelText="Search label" />,
      );

      expect(document.body.contains(getByText('Search label'))).toBe(true);
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
      //const button = getByRole('button', { name: 'Clear button' });

      await user.keyboard('[Tab]'); // Focus the input
      await user.keyboard('[Tab]'); // Focus the clear button
      await user.keyboard('[Enter]');

      expect(handleChange).toHaveBeenCalledWith('');
      expect(document.activeElement).toBe(input);
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

    it('clears input and refocuses when pressing Escape', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { getByRole } = render(
        <Search onChange={handleChange} value="test" />,
      );
      const input = getByRole('textbox');

      await user.type(input, 'test');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(handleChange).toHaveBeenCalledWith('');
      expect(document.activeElement).toBe(input);
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

      await user.click(button);

      expect(handleChange).toHaveBeenCalledWith('');
      expect(document.activeElement).toBe(input);
    });

    it('does not call onChange if input is empty when Escape is pressed', async () => {
      const handleChange = vi.fn();
      const { getByRole } = render(<Search onChange={handleChange} value="" />);
      const input = getByRole('textbox');

      fireEvent.keyDown(input, { key: 'Escape' });

      expect(handleChange).not.toHaveBeenCalled();
    });
  });
});
