import { render } from '@testing-library/react';

import App from './app';
window.PxWeb2Config = {
  language: {
    supportedLanguages: ['en', 'no', 'ar', 'sv'],
    defaultLanguage: 'en',
    fallbackLanguage: 'en',
  },
};

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });
});
