import { useTranslation } from 'react-i18next';

import {
  Button,
  Heading,
  BodyShort,
  BodyLong,
  Ingress,
  Label,
} from '@pxweb2/pxweb2-ui';

function test(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
  event.preventDefault();
  alert('test');
}
function testSubmit() {
  alert('test submit');
}

export function App() {
  const { t, i18n } = useTranslation();
  
  const locales = {
    en: { title: 'English' },
    no: { title: 'Norsk' },
    sv: { title: 'Svenska' },
  };  

  return (
    <>
      <ul>
        {Object.keys(locales).map((locale) => (
          <li key={locale}><button style={{ fontWeight: i18n.resolvedLanguage === locale ? 'bold' : 'normal' }} type="submit" onClick={() => i18n.changeLanguage(locale)}>
            {locales[locale as keyof typeof locales].title}
          </button></li>
        ))}
      </ul>
      <Heading level="1" size="xlarge">
        Welcome to PxWeb 2.0
      </Heading>
      <br />
      <Ingress spacing>
        {t('main.header')}
      </Ingress>
      <BodyShort size="medium" spacing align="start" weight="regular">
        BodyShort: This component will be used for text with not more than 80
        characters.
      </BodyShort>
      <BodyLong size="medium" spacing align="start" weight="regular">
        BodyLong: This is a story about Little Red Ridinghood. One day she went
        into the wood to visit her grandmother. The day after too, She visited
        her every day, every week, every month, every year. She never saw a
        wolf, no even a little fox.
      </BodyLong>
      <form id="form1" onSubmit={testSubmit}>
        <Label htmlFor="fname" textcolor="subtle">
          First name:
        </Label>
        <br />
        <input type="text" id="fname" name="fname" defaultValue="John" />
        <br />
        <Label htmlFor="lname" textcolor="subtle">
          Last name:
        </Label>
        <br />
        <input type="text" id="lname" name="lname" defaultValue="Doe" />
      </form>
      <br />
      <Button form="form1" variant="primary" type="submit">
        Submit
      </Button>
      <br />
      <br />
      <form id="form2" onSubmit={testSubmit}>
        <Label htmlFor="address" textcolor="subtle">
          Address:
        </Label>
        <br />
        <input
          type="text"
          id="address"
          name="address"
          defaultValue="Baker Street no 45"
        />
      </form>
      <br />
      <Button form="form2" variant="secondary" type="submit">
        Submit
      </Button>
      <br />
      <br />
      <Button variant="secondary" icon="FloppyDisk" onClick={test}></Button>
      &nbsp;
      <Button variant="secondary" icon="Heart" onClick={test}></Button>
    </>
  );
}

export default App;
