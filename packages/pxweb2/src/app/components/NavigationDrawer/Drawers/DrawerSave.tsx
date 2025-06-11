import { useTranslation } from 'react-i18next';
import { Button, ContentBox } from '@pxweb2/pxweb2-ui';
import {
  VariableSelection,
  VariablesSelection,
} from 'packages/pxweb2-api-client/src';
import { exportToFile } from '../../../util/export/exportUtil';
import useVariables from '../../../context/useVariables';

export type DrawerSaveProps = {
  readonly tableId: string;
};
export function DrawerSave({ tableId }: DrawerSaveProps) {
  const { t, i18n } = useTranslation();
  const variables = useVariables();

  async function saveToFile(fileFormat: string): Promise<void> {
    const selections: Array<VariableSelection> = [];

    // Get selection from Selection provider
    const ids = variables.getUniqueIds();
    ids.forEach((id) => {
      const selectedCodeList = variables.getSelectedCodelistById(id);
      const selection: VariableSelection = {
        variableCode: id,
        valueCodes: variables.getSelectedValuesByIdSorted(id),
      };

      // Add selected codelist to selection if it exists
      if (selectedCodeList) {
        selection.codeList = selectedCodeList;
      }

      selections.push(selection);
    });

    const variablesSelection: VariablesSelection = {
      selection: selections,
    };

    exportToFile(tableId, i18n.language, variablesSelection, fileFormat);
  }

  return (
    <ContentBox title={t('presentation_page.sidemenu.save.file.title')}>
      <Button variant="secondary" onClick={() => saveToFile('excel')}>
        {t('presentation_page.sidemenu.save.file.excel')}
      </Button>
      <Button variant="secondary" onClick={() => saveToFile('csv')}>
        {t('presentation_page.sidemenu.save.file.csv')}
      </Button>
      <Button variant="secondary" onClick={() => saveToFile('px')}>
        {t('presentation_page.sidemenu.save.file.px')}
      </Button>
      <Button variant="secondary" onClick={() => saveToFile('jsonstat2')}>
        {t('presentation_page.sidemenu.save.file.jsonstat2')}
      </Button>
      <Button variant="secondary" onClick={() => saveToFile('html')}>
        {t('presentation_page.sidemenu.save.file.html')}
      </Button>
      <Button variant="secondary" onClick={() => saveToFile('parquet')}>
        {t('presentation_page.sidemenu.save.file.parquet')}
      </Button>
    </ContentBox>
  );
}
export default DrawerSave;
