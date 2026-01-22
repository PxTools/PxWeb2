import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import i18n from '../../../i18n/config';

import styles from './ApiQuery.module.scss';
import {
  BodyLong,
  Link,
  Chips,
  CodeSnippet,
  Select,
  SelectOption,
} from '@pxweb2/pxweb2-ui';
import { useApiQueryInfo } from '../../util/apiQuery/apiQueryUtil';
import { fileFormats } from '../../constants/outputFormats';

export interface ApiQueryProps {}

export const ApiQuery: React.FC<ApiQueryProps> = () => {
  const { t } = useTranslation();
  const [httpMethod, setHttpMethod] = useState<'GET' | 'POST'>('GET');
  const [selectedFormat, setSelectedFormat] = useState('jsonstat2');
  const apiQueryInfo = useApiQueryInfo(i18n.language, selectedFormat);

  const codeSnippetTranslations = {
    copyButtonLabel: t('common.code_snippet.copy_button_label'),
    copiedButtonLabel: t('common.code_snippet.copied_button_label'),
    copyButtonTooltip: t('common.code_snippet.copy_button_tooltip'),
    wrapCodeButtonLabel: t('common.code_snippet.wrap_code_button_label'),
    unwrapCodeButtonLabel: t('common.code_snippet.unwrap_code_button_label'),
  };
  const translate = t as unknown as (key: string) => string;
  const apiLinkUrl = t('presentation_page.side_menu.save.api.link_url');

  function selectedOptionChanged(selectedItem: SelectOption | undefined) {
    if (selectedItem) {
      setSelectedFormat(selectedItem.value);
    }
  }

  return (
    <div className={cl(styles.apiQuery)}>
      <div className={cl(styles.descriptionAndLink)}>
        <div className={cl(styles.descriptionWrapper)}>
          <BodyLong size="medium">
            {t('presentation_page.side_menu.save.api.description')}
          </BodyLong>
        </div>
        {apiLinkUrl && (
          <div className={cl(styles.linkWrapper)}>
            <Link href={apiLinkUrl} size="medium" target="_blank">
              {t('presentation_page.side_menu.save.api.link_text')}
            </Link>
          </div>
        )}
      </div>
      <div className={cl(styles.selectWrapper)}>
        <Select
          label={t('presentation_page.side_menu.save.api.select_format')}
          variant="default"
          selectedOption={fileFormats
            .map((format) => ({
              value: format.value,
              label: translate(
                `presentation_page.side_menu.save.file.formats.${format.value}`,
              ),
            }))
            .find((option) => option.value === selectedFormat)}
          onChange={selectedOptionChanged}
          options={fileFormats.map((format) => ({
            value: format.value,
            label: translate(
              `presentation_page.side_menu.save.file.formats.${format.value}`,
            ),
          }))}
        />
      </div>
      <div className={cl(styles.chipsWrapper)}>
        <Chips
          aria-label={t(
            'presentation_page.side_menu.save.api.select_http_method_aria',
          )}
        >
          <Chips.Toggle
            selected={httpMethod === 'GET'}
            checkmark={false}
            onClick={() => setHttpMethod('GET')}
          >
            {t('presentation_page.side_menu.save.api.get_button_text')}
          </Chips.Toggle>
          <Chips.Toggle
            selected={httpMethod === 'POST'}
            checkmark={false}
            onClick={() => setHttpMethod('POST')}
          >
            {t('presentation_page.side_menu.save.api.post_button_text')}
          </Chips.Toggle>
        </Chips>
      </div>
      <div className={cl(styles.postWrapper)}>
        <div className={cl(styles.codeSnippetWrapper)}>
          <CodeSnippet
            highlight="text"
            title={`${httpMethod} URL`}
            translations={codeSnippetTranslations}
          >
            {httpMethod === 'GET' ? apiQueryInfo.getUrl : apiQueryInfo.postUrl}
          </CodeSnippet>
        </div>
        {httpMethod === 'POST' && (
          <div className={cl(styles.codeSnippetWrapper)}>
            <CodeSnippet
              highlight="json"
              maxHeight="628px"
              title={t('presentation_page.side_menu.save.api.post_body_text')}
              translations={codeSnippetTranslations}
            >
              {apiQueryInfo.postBody}
            </CodeSnippet>
          </div>
        )}
      </div>
    </div>
  );
};
