import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Search from './Search';

describe('Search', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Search variant="default" />);

    expect(baseElement).toBeTruthy();
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { getByRole } = render(
      <Search variant="default" onChange={handleChange} />,
    );
    const input = getByRole('textbox');

    await user.type(input, 'hello');

    expect(handleChange).toHaveBeenCalledWith('h');
    expect(handleChange).toHaveBeenCalledWith('hello');
  });

  it('should display label when showLabel is true', () => {
    const { getByText } = render(
      <Search variant="default" showLabel labelText="Search label" />,
    );

    expect(document.body.contains(getByText('Search label'))).toBe(true);
  });

  it('should clear input and refocus when clear button is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const { getByRole } = render(
      <Search variant="default" onChange={handleChange} value="test" />,
    );
    const input = getByRole('textbox');
    const button = getByRole('button');

    await user.click(button);

    expect(handleChange).toHaveBeenCalledWith('');
    expect(document.activeElement).toBe(input);
  });
});
