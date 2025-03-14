import { useTranslation } from 'react-i18next';

import { SkipToMain } from './components/SkipToMain/SkipToMain';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';

export function App() {
  const { t } = useTranslation();

  return (
    <>
      <SkipToMain />
      <Header />
      <div>
        <h1>{t('start_page.header')}</h1>
        <p>{t('start_page.welcome_trans_test')}</p>
      </div>
      <Footer />
    </>
  );
}

export default App;
