import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import cl from 'clsx';

import styles from './app.module.scss';
import {
  Button,
  BodyShort,
  BodyLong,
  Heading,
  Ingress,
  Label,
  Select,
  SelectOption,
  PxTable,
  Search,
  Tag,
  VariableBox,
} from '@pxweb2/pxweb2-ui';
import useLocalizeDocumentAttributes from '../i18n/useLocalizeDocumentAttributes';
//import { NumberFormatter } from '../i18n/formatters';
import { TableService } from '@pxweb2/pxweb2-api-client';
import { mapTableMetadataResponse } from '../mappers/TableMetadataResponseMapper';
import { Header } from './components/Header/Header';
import NavigationRail from './components/NavigationRail/NavigationRail';
import { Content } from './components/Content/Content';
import NavigationBar from './components/NavigationBar/NavigationBar';

function test(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
  event.preventDefault();
  console.log('test');
}
function testSubmit() {
  console.log('test submit');
}
function selectedOptionChanged(selectedItem: SelectOption | undefined) {
  selectedItem
    ? console.log('Selected option: ' + selectedItem.label)
    : console.log('No option selected');
}

export function App() {
  const { t, i18n } = useTranslation();

  const [tableid, setTableid] = useState('tab638');
  const [errorMsg, setErrorMsg] = useState('');
  const [pxTable, setPxTable] = useState<PxTable | null>(null);

  const options: SelectOption[] = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
  ];

  /* TODO: Is there a mistake with this? on first load of the page? We keep getting a warning of missing key on li element, pointing to loading the translation on line 34 */
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
    TableService.getMetadataById(id, i18n.resolvedLanguage)
      .then((tableMetadataResponse) => {
        const pxTab: PxTable = mapTableMetadataResponse(tableMetadataResponse);
        setPxTable(pxTab);
        setErrorMsg('');
      })
      .catch((error) => {
        setErrorMsg('Could not get table: ' + id);
        setPxTable(null);
      });
  };

  return (
    <>
      <Header />
      <div className={styles.main}>
        <div className={styles.desktopNavigation}>
          <NavigationRail />
        </div>
        <div className={styles.mobileNavigation}>
          <NavigationBar />
        </div>
        <Content>
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
            BodyShort: This component will be used for text with not more than
            80 characters.
          </BodyShort>
          <BodyLong size="medium" spacing align="start" weight="regular">
            BodyLong: This is a story about Little Red Ridinghood. One day she
            went into the wood to visit her grandmother. The day after too, She
            visited her every day, every week, every month, every year. She
            never saw a wolf, no even a little fox.
          </BodyLong>
          <Label htmlFor="tabid" textcolor="subtle">
            Enter table id:
          </Label>
          <br />
          <select
            name="tabid"
            id="tabid"
            onChange={(e) => setTableid(e.target.value)}
          >
            <option value="TAB638">TAB638</option>
            <option value="TAB1292">TAB1292</option>
            <option value="TAB5659">TAB5659</option>
          </select>
          {/* <input
        type="text"
        id="tabid"
        name="tabid"
        defaultValue="tab638"
        onChange={(e) => setTableid(e.target.value.trim())}
      /> */}
          &nbsp;
          {errorMsg.length > 0 && (
            <Tag size="small" variant="error" type="border">
              {errorMsg}
            </Tag>
          )}
          <br />
          <br />
          <Button variant="secondary" onClick={() => getTable(tableid)}>
            Get table
          </Button>
          <br />
          <div className={cl(styles.variableBoxContainer)}>
            {/* TODO: I think the warning in the console about unique IDs is the variable.id below*/}
            {pxTable &&
              pxTable.variables.length > 0 &&
              pxTable.variables.map(
                (variable) =>
                  variable.id && (
                    <VariableBox
                      id={variable.id}
                      label={variable.label}
                      mandatory={variable.mandatory}
                      values={variable.values}
                      codeLists={variable.codeLists}
                    />
                  )
              )}
          </div>
          <br />
          {pxTable && (
            <div>
              <br></br>
              <Label>{pxTable.label}</Label>
              <ul>
                {pxTable.variables.map((variable) => (
                  <li key={variable.id}>
                    <h3>{variable.label}</h3>
                    {variable.mandatory && (
                      <Tag size="xsmall" variant="info" type="border">
                        Mandatory
                      </Tag>
                    )}
                    <ul>
                      <h4>Values:</h4>
                      {variable.values.map((value) => (
                        <li key={value.code}>
                          {value.label}
                          <ul>
                            {value.notes?.map((note) => (
                              <li key={note.text}>{note.text}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                    <ol>
                      <h4>CodeLists:</h4>
                      {variable.codeLists?.map((codelist) => (
                        <li key={codelist.id}>{codelist.label}</li>
                      ))}
                    </ol>
                    <ul>
                      <h4>Notes:</h4>
                      {variable.notes?.map((note) => (
                        <li key={note.text}>{note.text}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <br />
          <div className={cl(styles.selectWrapper)}>
            <Select
              variant="default"
              label="Default"
              placeholder="Make selection"
              options={options}
              onChange={selectedOptionChanged}
            ></Select>
          </div>
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
          <Search
            variant="default"
            showLabel={true}
            searchPlaceHolder={t(
              'presentation_page.sidemenu.selection.variablebox.search.placeholder'
            )}
            labelText={t(
              'presentation_page.sidemenu.selection.variablebox.search.label'
            )}
            ariaLabelIconText={t(
              'presentation_page.sidemenu.selection.variablebox.search.arialabelicontext'
            )}
            arialLabelClearButtonText={t(
              'presentation_page.sidemenu.selection.variablebox.search.ariallabelclearbuttontext'
            )}
          ></Search>
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
            Example of getting a translation from a nested translation
            key:&nbsp;
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
          <div className={cl(styles.breakpoints)}>Breakpoint test</div>
        </Content>
      </div>
    </>
  );
}

export default App;
