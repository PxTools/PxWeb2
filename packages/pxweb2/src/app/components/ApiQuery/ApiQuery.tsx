import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import styles from './ApiQuery.module.scss';
import { BodyLong, Link, Chips, CodeSnippet } from '@pxweb2/pxweb2-ui';

export interface ApiQueryProps {}

export const ApiQuery: React.FC<ApiQueryProps> = () => {
  const { t } = useTranslation();
  const [httpMethod, setHttpMethod] = useState<'GET' | 'POST'>('GET');

  const codeSnippetTranslations = {
    copyButtonLabel: t('common.code_snippet.copy_button_label'),
    copiedButtonLabel: t('common.code_snippet.copied_button_label'),
    copyButtonTooltip: t('common.code_snippet.copy_button_tooltip'),
    wrapCodeButtonLabel: t('common.code_snippet.wrap_code_button_label'),
    unwrapCodeButtonLabel: t('common.code_snippet.unwrap_code_button_label'),
  };

  return (
    <div className={cl(styles.apiQuery)}>
      <div className={cl(styles.descriptionAndLink)}>
        <div className={cl(styles.descriptionWrapper)}>
          <BodyLong size="medium">
            API query description text. API query description text. API query
            description text. API query description text. API query description
            text. API query description text. API query description text. API
            query description text.
          </BodyLong>
        </div>
        <div className={cl(styles.linkWrapper)}>
          <Link href="#" size="medium">
            Read more about API
          </Link>
        </div>
      </div>
      <div className={cl(styles.selectWrapper)}>
        <select name="cars" id="cars">
          <option value="volvo">Volvo</option>
          <option value="saab">Saab</option>
          <option value="mercedes">Mercedes</option>
          <option value="audi">Audi</option>
        </select>
      </div>
      <div className={cl(styles.chipsWrapper)}>
        <Chips>
          <Chips.Toggle
            selected={httpMethod === 'GET'}
            checkmark={false}
            onClick={() => setHttpMethod('GET')}
          >
            GET
          </Chips.Toggle>
          <Chips.Toggle
            selected={httpMethod === 'POST'}
            checkmark={false}
            onClick={() => setHttpMethod('POST')}
          >
            POST
          </Chips.Toggle>
        </Chips>
      </div>
      <div className={cl(styles.codeSnippetWrapper)}>
        <CodeSnippet
          title={`${httpMethod} URL`}
          translations={codeSnippetTranslations}
        >
          {`https://pxweb2.pages.dev/api/v0/en/ExampleDataset`}
        </CodeSnippet>
      </div>
      {httpMethod === 'POST' && (
        <div className={cl(styles.codeSnippetWrapper)}>
          <CodeSnippet
            title={`POST BODY`}
            translations={codeSnippetTranslations}
          >
            {`{
  "query": [
    {
      "code": "region"
    }
  ]
}`}
          </CodeSnippet>
        </div>
      )}
    </div>
  );
};
