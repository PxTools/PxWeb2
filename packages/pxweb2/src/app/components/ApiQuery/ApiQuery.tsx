import { useTranslation } from 'react-i18next';
import { CodeSnippet } from '@pxweb2/pxweb2-ui';

export interface ApiQueryProps {
  temp: string;
}

export const ApiQuery: React.FC<ApiQueryProps> = ({ temp }) => {
  const { t } = useTranslation();

  const codeSnippetTranslations = {
    copyButtonLabel: t('common.code_snippet.copy_button_label'),
    copiedButtonLabel: t('common.code_snippet.copied_button_label'),
    copyButtonTooltip: t('common.code_snippet.copy_button_tooltip'),
    wrapCodeButtonLabel: t('common.code_snippet.wrap_code_button_label'),
    unwrapCodeButtonLabel: t('common.code_snippet.unwrap_code_button_label'),
  };

  return (
    <div>
      <CodeSnippet title={temp} translations={codeSnippetTranslations}>
        {`{
        "query": [
          {
            "code": "region"
          }
        ],
      }`}
      </CodeSnippet>
    </div>
  );
};
