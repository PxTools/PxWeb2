import { useTranslation, Trans } from 'react-i18next';
import cl from 'clsx';

import classes from './app.module.scss';
import {
  Button,
  Heading,
  BodyShort,
  BodyLong,
  Ingress,
  Label,
  Tag,
} from '@pxweb2/pxweb2-ui';
import useLocalizeDocumentAttributes from '../i18n/useLocalizeDocumentAttributes';
import { NumberFormatter } from '../i18n/formatters';
import { TableService, TableMetadataResponse } from '@pxweb2/pxweb2-api-client';
import { useState } from 'react';

function test(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
  event.preventDefault();
  alert('test');
}
function testSubmit() {
  alert('test submit');
}

export function App() {
  const { t, i18n } = useTranslation();

  const [tableid, setTableid] = useState('tab005');
  const [px, setPx] = useState<TableMetadataResponse | null>(null); // Update the type of px state variable

  const locales = {
    en: { title: 'English' },
    no: { title: 'Norsk' },
    sv: { title: 'Svenska' },
    ar: { title: 'العربية' },
  };

  const customRoundingMode = 'halfExpand';
  const customMinDecimals = 2;
  const customMaxDecimals = 4;

  useLocalizeDocumentAttributes();

  const getTable = (id: string) => {
    TableService.getMetadataById(id, i18n.resolvedLanguage).then((px) =>
      setPx(px)
    );
  };

  // useEffect(() => {
  //   TableService.getMetadataById(tableid, i18n.resolvedLanguage).then((px) =>
  //     setPx(px)
  //   );
  // }, [i18n.resolvedLanguage, tableid]);

  //if (!px) return <div>Loading...</div>;

  return (
    <>
      <ul>
        {Object.keys(locales).map((locale) => (
          <li key={locale}>
            <button
              style={{
                fontWeight:
                  i18n.resolvedLanguage === locale ? 'bold' : 'normal',
              }}
              type="submit"
              onClick={() => i18n.changeLanguage(locale)}
            >
              {locales[locale as keyof typeof locales].title}
            </button>
          </li>
        ))}
      </ul>
      <Heading level="1" size="xlarge">
        {t('common.title')}
      </Heading>
      <br />
      <Ingress spacing>{t('start_page.header')}</Ingress>
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
      <Label htmlFor="tabid" textcolor="subtle">
        Enter table id:
      </Label>
      <br />
      <input
        type="text"
        id="tabid"
        name="tabid"
        defaultValue="tab005"
        onChange={(e) => setTableid(e.target.value)}
      />
      <br />
      <br />
      <Button variant="secondary" onClick={() => getTable(tableid)}>
        Get table
      </Button>
      <br />
      {px && (
        <div>
          <br></br>
          <Label>{px.label}</Label>
          <ul>
            {px.variables.map((variable) => (
              <li key={variable.id}>{variable.label}</li>
            ))}
          </ul>
        </div>
      )}
      <br />
      <Tag size="medium" variant="info">
        Mandatory
      </Tag>
      &nbsp;
      <Tag size="medium" variant="info" type="border">
        Mandatory
      </Tag>
      &nbsp;
      <br />
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
      <Button variant="secondary" icon="FloppyDisk" onClick={test}></Button>
      &nbsp;
      <Button variant="secondary" icon="Heart" onClick={test}></Button>
      <p>
        {t('date.simple_date', {
          value: new Date('2024-01-25'),
        })}
      </p>
      <p>
        {t('date.simple_date_with_time', {
          value: new Date('2024-01-25 12:34:56'),
        })}
      </p>
      <p>
        <Trans i18nKey="start_page.welcome_trans_test">
          "Welcome to the <b>app</b> for PxWeb 2.0!"
        </Trans>
      </p>
      <BodyShort size="medium" spacing align="start" weight="regular">
        Example of getting a translation from a nested translation key:&nbsp;
        {t('presentation_page.sidemenu.edit.customize.pivot.title')}
      </BodyShort>
      {/*       <p>Test custom number formatter: {NumberFormatter(2000.6666666, 2)}</p>
       */}{' '}
      <p>
        Simple number:{' '}
        {t('number.simple_number', {
          value: 2000.066666666,
        })}
      </p>
      <p>
        Simple number with custom decimals:{' '}
        {t('number.simple_number', {
          value: 2000.00007,
          minimumFractionDigits: customMinDecimals,
          maximumFractionDigits: customMaxDecimals,
          roundingMode: customRoundingMode,
        })}
      </p>
      <p>
        Simple number with 0 decimals:{' '}
        {t('number.simple_number_with_zero_decimal', {
          value: 2000.044444444,
        })}
      </p>
      <p>
        Simple number with 1 decimal:{' '}
        {t('number.simple_number_with_one_decimal', {
          value: 2000.044444444,
        })}
      </p>
      <p>
        Simple number with 2 decimals:{' '}
        {t('number.simple_number_with_two_decimals', {
          value: 2000.044444444,
        })}
      </p>
      <p>
        Simple number with 3 decimals:{' '}
        {t('number.simple_number_with_three_decimals', {
          value: 2000.044444444,
        })}
      </p>
      <p>
        Simple number with 4 decimals:{' '}
        {t('number.simple_number_with_four_decimals', {
          value: 2000.044444444,
        })}
      </p>
      <p>
        Simple number with 5 decimals:{' '}
        {t('number.simple_number_with_five_decimals', {
          value: 2000.044447444,
        })}
      </p>
      <p>
        Round test:{' '}
        {t('number.simple_number_with_one_decimal', {
          value: 2.23,
        })}
      </p>
      <p>
        {' '}
        {t('number.simple_number_with_one_decimal', {
          value: 2.25,
        })}
      </p>
      <p>
        {' '}
        {t('number.simple_number_with_one_decimal', {
          value: 2.28,
        })}
      </p>
      <p>
        {' '}
        {t('number.simple_number_with_one_decimal', {
          value: -2.23,
        })}
      </p>
      <p>
        {' '}
        {t('number.simple_number_with_one_decimal', {
          value: -2.25,
        })}
      </p>
      <p>
        {' '}
        {t('number.simple_number_with_one_decimal', {
          value: -2.28,
        })}
      </p>
      <div className={cl(classes.breakpoints)}>Breakpoint test</div>
    </>
  );
}

export default App;
