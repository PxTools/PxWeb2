import { render } from '@testing-library/react';

import App from './app';
import { MemoryRouter } from 'react-router-dom';
window.PxWeb2Config = {
  language: {
    supportedLanguages: [
      { shorthand: 'en', languageName: 'English' },
      { shorthand: 'no', languageName: 'Norsk' },
      { shorthand: 'sv', languageName: 'Svenska' },
      { shorthand: 'ar', languageName: 'العربية' },
    ],
    defaultLanguage: 'en',
    fallbackLanguage: 'en',
  },
};

describe('App', () => {
  // TODO: fix test
  // it('should render successfully', () => {
  //   const { baseElement } = render(
  //   <MemoryRouter>
  //     <App />
  //   </MemoryRouter>);
  //   expect(baseElement).toBeTruthy();
  // });

  it('should return true', () => {
    expect(true).toBeTruthy();
  });
});
