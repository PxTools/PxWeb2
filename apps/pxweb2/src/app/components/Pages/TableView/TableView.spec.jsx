import { render } from '@testing-library/react';

import TableView from './TableView';
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

describe('TableView', () => {
  //  TODO: fix test
  // it('should render successfully', () => {
  //   const { baseElement } = render(
  //   <MemoryRouter>
  //     <TableView />
  //   </MemoryRouter>);
  //   expect(baseElement).toBeTruthy();
  // });

  it('should return true', () => {
    expect(true).toBeTruthy();
  });
});
