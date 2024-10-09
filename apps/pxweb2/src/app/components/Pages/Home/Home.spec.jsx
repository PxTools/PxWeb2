import { render } from '@testing-library/react';

import TableView from './Home';
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
  it('should render successfully', () => {
    const { baseElement } = render(
    <MemoryRouter>
      <TableView />
    </MemoryRouter>);
    expect(baseElement).toBeTruthy();
  });
});
