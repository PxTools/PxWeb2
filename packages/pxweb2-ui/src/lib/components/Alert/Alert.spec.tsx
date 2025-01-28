// Mock react-i18next's useTranslation hook
// needs to be imported before the component
import { mockReactI18next } from '../../../lib/util/testing-utils';
mockReactI18next();

import { render } from '@testing-library/react';

import Alert from './Alert';

describe('Alert', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Alert variant="info" />);
    expect(baseElement).toBeTruthy();
  });
});
