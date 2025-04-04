import { getLabelText } from './utils';

describe('getLabelText', () => {
  it('should return the code when valueDisplayType is "code"', () => {
    const result = getLabelText('code', '123', 'Label');

    expect(result).toBe('123');
  });

  it('should return the label when valueDisplayType is "value"', () => {
    const result = getLabelText('value', '123', 'Label');

    expect(result).toBe('Label');
  });

  it('should combine and then return the code and the label when valueDisplayType is "code_value"', () => {
    const result = getLabelText('code_value', '123', 'Label');

    expect(result).toBe('123 Label');
  });
});
