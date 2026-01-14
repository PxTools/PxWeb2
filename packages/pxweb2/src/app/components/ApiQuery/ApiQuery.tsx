import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import styles from './ApiQuery.module.scss';
import { BodyLong, Link, Chips, CodeSnippet } from '@pxweb2/pxweb2-ui';

export interface ApiQueryProps {}

export const ApiQuery: React.FC<ApiQueryProps> = () => {
  const { t } = useTranslation();

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
          <Chips.Toggle selected checkmark={false}>
            GET
          </Chips.Toggle>
          <Chips.Toggle checkmark={false}>POST</Chips.Toggle>
        </Chips>
      </div>
      <div className={cl(styles.codeSnippetWrapper)}>
        <CodeSnippet title="GET URL" translations={codeSnippetTranslations}>
          {`{
            "query": [
          {
            "code": "region"
          }
        ],
      }`}
        </CodeSnippet>
      </div>
    </div>
  );
};
