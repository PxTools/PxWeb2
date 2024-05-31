import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './app.module.scss';
import {
  Button,
  PxTableMetadata,
  VariableBox,
  Variable,
  Table,
  VartypeEnum,
  PxTable,
  fakeData,
  SelectedVBValues,
  Value,
  SelectOption,
} from '@pxweb2/pxweb2-ui';
import useLocalizeDocumentAttributes from '../i18n/useLocalizeDocumentAttributes';
import { TableService } from '@pxweb2/pxweb2-api-client';
import { mapTableMetadataResponse } from '../mappers/TableMetadataResponseMapper';
import { Header } from './components/Header/Header';
import NavigationRail from './components/NavigationRail/NavigationRail';
import { Content } from './components/Content/Content';
import NavigationBar from './components/NavigationBar/NavigationBar';
import NavigationDrawer from './components/NavigationDrawer/NavigationDrawer';

function addSelectedCodeListToVariable(
  currentVariable: SelectedVBValues | undefined,
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  selectedItem: SelectOption
): SelectedVBValues[] {
  let newSelectedValues: SelectedVBValues[] = [];

  if (currentVariable) {
    newSelectedValues = selectedValuesArr.map((variable) => {
      if (variable.id === varId) {
        variable.selectedCodeList = selectedItem;
        variable.values = []; // Always reset values when changing codelist
      }

      return variable;
    });
  }
  if (!currentVariable) {
    newSelectedValues = [
      ...selectedValuesArr,
      {
        id: varId,
        selectedCodeList: selectedItem,
        values: [],
      },
    ];
  }

  return newSelectedValues;
}

function addValueToVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  value: Value['code']
) {
  const newSelectedValues = selectedValuesArr.map((variable) => {
    if (variable.id === varId) {
      variable.values = [...variable.values, value];
    }

    return variable;
  });

  return newSelectedValues;
}

function addValueToNewVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  value: Value['code']
) {
  const newSelectedValues = [
    ...selectedValuesArr,
    { id: varId, selectedCodeList: undefined, values: [value] },
  ];

  return newSelectedValues;
}

function removeValueOfVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  value: Value['code']
) {
  const newSelectedValues = selectedValuesArr
    .map((variable) => {
      if (variable.id === varId) {
        const hasMultipleValuesSelected = variable.values.length > 1;

        if (
          hasMultipleValuesSelected ||
          (!hasMultipleValuesSelected &&
            variable.selectedCodeList !== undefined)
        ) {
          variable.values = variable.values.filter((val) => val !== value);
        }
        if (
          !hasMultipleValuesSelected &&
          variable.selectedCodeList === undefined
        ) {
          return null;
        }
      }

      return variable;
    })
    .filter((value) => value !== null) as SelectedVBValues[];

  return newSelectedValues;
}

function addAllValuesToVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  allValuesOfVariable: Value[]
): SelectedVBValues[] {
  const currentVariable = selectedValuesArr.find(
    (variable) => variable.id === varId
  );
  let newSelectedValues: SelectedVBValues[] = [];

  if (currentVariable) {
    newSelectedValues = selectedValuesArr.map((variable) => {
      if (variable.id === varId) {
        variable.values = allValuesOfVariable.map((value) => value.code);
      }

      return variable;
    });
  }
  if (!currentVariable) {
    newSelectedValues = [
      ...selectedValuesArr,
      {
        id: varId,
        selectedCodeList: undefined,
        values: allValuesOfVariable.map((value) => value.code),
      },
    ];
  }

  return newSelectedValues;
}

function removeAllValuesOfVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string
): SelectedVBValues[] {
  const newValues: SelectedVBValues[] = selectedValuesArr
    .map((variable) => {
      if (variable.id === varId) {
        if (variable.selectedCodeList !== undefined) {
          return {
            id: varId,
            selectedCodeList: variable.selectedCodeList,
            values: [],
          };
        }
        if (variable.selectedCodeList === undefined) {
          return null;
        }
      }

      return variable;
    })
    .filter((value) => value !== null) as SelectedVBValues[];

  return newValues;
}

export type NavigationItem =
  | 'none'
  | 'filter'
  | 'view'
  | 'edit'
  | 'save'
  | 'help';

export function App() {
  const { i18n } = useTranslation();

  const [tableid, setTableid] = useState('tab638');
  const [errorMsg, setErrorMsg] = useState('');
  const [pxTable, setPxTable] = useState<PxTable | null>(null);
  const [selectedNavigationView, setSelectedNavigationView] =
    useState<NavigationItem>('none');
  const [pxData, setPxData] = useState<string | null>('');
  const [pxTableMetaToRender, setPxTableMetaToRender] =
    // Metadata to render in the UI
    useState<PxTableMetadata | null>(null);
  const [selectedVBValues, setSelectedVBValues] = useState<SelectedVBValues[]>(
    []
  );

  if (pxTableMetaToRender === null && pxTable?.metadata !== null) {
    if (pxTable?.metadata) {
      setPxTableMetaToRender(structuredClone(pxTable.metadata));
    }
  }

  const changeSelectedNavView = (newSelectedNavView: NavigationItem) => {
    if (selectedNavigationView === newSelectedNavView) {
      setSelectedNavigationView('none');
    } else {
      setSelectedNavigationView(newSelectedNavView);
    }
  };

  useLocalizeDocumentAttributes();

  function handleCodeListChange(
    selectedItem: SelectOption | undefined,
    varId: string
  ) {
    const prevSelectedValues = structuredClone(selectedVBValues);
    const currentVariable = prevSelectedValues.find(
      (variable) => variable.id === varId
    );

    // No new selection made, do nothing
    if (
      !selectedItem ||
      selectedItem.value === currentVariable?.selectedCodeList?.value
    ) {
      return;
    }

    //  Incomplete selectItem
    if (!selectedItem.label || !selectedItem.value) {
      return;
    }

    const newSelectedValues = addSelectedCodeListToVariable(
      currentVariable,
      prevSelectedValues,
      varId,
      selectedItem
    );

    setSelectedVBValues(newSelectedValues);

    //  TODO: This currently returns dummy data until we have the API call setup for it
    const valuesForChosenCodeList: Value[] = getCodeListValues(
      selectedItem?.value
    );

    if (pxTableMetaToRender === null || valuesForChosenCodeList.length < 1) {
      return;
    }

    const newPxTableMetaToRender: PxTableMetadata =
      structuredClone(pxTableMetaToRender);

    newPxTableMetaToRender.variables.forEach((variable) => {
      if (!variable.codeLists) {
        return;
      }

      variable.codeLists.forEach((codelist) => {
        if (codelist.id !== selectedItem?.value) {
          return;
        }

        for (let i = 0; i < newPxTableMetaToRender.variables.length - 1; i++) {
          if (newPxTableMetaToRender.variables[i].id !== variable.id) {
            continue;
          }

          newPxTableMetaToRender.variables[i].values = valuesForChosenCodeList;
        }
      });
    });

    setPxTableMetaToRender(newPxTableMetaToRender);
  }

  const handleMixedCheckboxChange = (
    varId: string,
    allValuesSelected: string
  ) => {
    const prevSelectedValues = structuredClone(selectedVBValues);

    if (allValuesSelected === 'true') {
      const newSelectedValues = removeAllValuesOfVariable(
        prevSelectedValues,
        varId
      );

      setSelectedVBValues(newSelectedValues);
    }
    if (allValuesSelected === 'false' || allValuesSelected === 'mixed') {
      const allValuesOfVariable =
        pxTableMetaToRender?.variables.find((variable) => variable.id === varId)
          ?.values || [];
      const newSelectedValues = addAllValuesToVariable(
        prevSelectedValues,
        varId,
        allValuesOfVariable
      );

      setSelectedVBValues(newSelectedValues);
    }
  };

  const handleCheckboxChange = (varId: string, value: Value['code']) => {
    const prevSelectedValues = structuredClone(selectedVBValues);
    const hasVariable =
      selectedVBValues.findIndex((variables) => variables.id === varId) !== -1;
    const hasValue = selectedVBValues
      .find((variables) => variables.id === varId)
      ?.values.includes(value);

    if (hasVariable && hasValue) {
      const newSelectedValues = removeValueOfVariable(
        prevSelectedValues,
        varId,
        value
      );

      setSelectedVBValues(newSelectedValues);
    }
    if (hasVariable && !hasValue) {
      const newSelectedValues = addValueToVariable(
        prevSelectedValues,
        varId,
        value
      );

      setSelectedVBValues(newSelectedValues);
    }
    if (!hasVariable) {
      const newSelectedValues = addValueToNewVariable(
        prevSelectedValues,
        varId,
        value
      );

      setSelectedVBValues(newSelectedValues);
    }
  };

  const getTable = (id: string) => {
    TableService.getMetadataById(id, i18n.resolvedLanguage)
      .then((tableMetadataResponse) => {
        const pxTabMetadata: PxTableMetadata = mapTableMetadataResponse(
          tableMetadataResponse
        );
        const pxTable: PxTable = {
          metadata: pxTabMetadata,
          data: {
            cube: {},
            variableOrder: [],
            isLoaded: false,
          },
          stub: [],
          heading: [],
        };
        setPxTable(pxTable);
        handleVBReset();
        setErrorMsg('');
      })
      .catch((error) => {
        setErrorMsg('Could not get table: ' + id);
        setPxTable(null);
      });
    getData(id);
  };

  function handleVBReset() {
    if (selectedVBValues.length > 0) {
      setSelectedVBValues([]);
    }
    if (pxTableMetaToRender !== null) {
      setPxTableMetaToRender(null);
    }
  }

  const getCodeListValues = (id: string) => {
    /* TODO: Implement querying the API */
    const dummyValues: Value[] = [
      { code: 'Dummy Code 1', label: 'Dummy Value 1' },
      { code: '01', label: '01 Stockholm county' },
      { code: 'Dummy Code 2', label: 'Dummy Value 2' },
      { code: 'Dummy Code 3', label: 'Dummy Value 3' },
      { code: 'Dummy Code 4', label: 'Dummy Value 4' },
      { code: 'Dummy Code 5', label: 'Dummy Value 5' },
      { code: 'Dummy Code 6', label: 'Dummy Value 6' },
      { code: 'Dummy Code 7', label: 'Dummy Value 7' },
    ];

    return dummyValues;
  };

  const getData = (id: string) => {
    const url =
      'https://api.scb.se/OV0104/v2beta/api/v2/tables/' +
      id +
      '/data?lang=' +
      i18n.resolvedLanguage +
      '&outputFormat=html5_table';
    fetch(url)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const decoder = new TextDecoder('iso-8859-1');
        const tableDataResponse = decoder.decode(buffer);
        const thePxData: string = tableDataResponse;
        setPxData(thePxData);
        setErrorMsg('');
      })
      .catch((error) => {
        setErrorMsg('Could not get table: ' + id);
        setPxTable(null);
      });
  };

  const getFakeTable = () => {
    const variables: Variable[] = [
      {
        id: 'Region',
        label: 'region',
        type: VartypeEnum.GEOGRAPHICAL_VARIABLE,
        mandatory: false,
        values: Array.from(Array(4).keys()).map((i) => {
          return { label: 'region_' + (i + 1), code: 'R_' + (i + 1) };
        }),
      },
      {
        id: 'Alder',
        label: 'ålder',
        type: VartypeEnum.REGULAR_VARIABLE,
        mandatory: false,
        values: Array.from(Array(4).keys()).map((i) => {
          return { label: 'år ' + (i + 1), code: '' + (i + 1) };
        }),
      },
      {
        id: 'Civilstatus',
        label: 'civilstatus',
        type: VartypeEnum.REGULAR_VARIABLE,
        mandatory: false,
        values: Array.from(Array(5).keys()).map((i) => {
          return { label: 'CS_' + (i + 1), code: '' + (i + 1) };
        }),
      },
      {
        id: 'Kon',
        label: 'kön',
        type: VartypeEnum.REGULAR_VARIABLE,
        mandatory: false,
        values: Array.from(Array(2).keys()).map((i) => {
          return { label: 'G_' + (i + 1), code: '' + (i + 1) };
        }),
      },
      {
        id: 'TIME',
        label: 'tid',
        type: VartypeEnum.TIME_VARIABLE,
        mandatory: false,
        values: Array.from(Array(5).keys()).map((i) => {
          return { label: '' + (1968 + i), code: '' + (1968 + i) };
        }),
      },
    ];

    const tableMeta: PxTableMetadata = {
      id: 'test01',
      label: 'Test table',
      variables: variables,
    };
    const table: PxTable = {
      metadata: tableMeta,
      data: {
        cube: {},
        variableOrder: ['Region', 'Alder', 'Civilstatus', 'Kon', 'TIME'],
        isLoaded: false,
      },
      heading: [variables[0], variables[1]],
      stub: [variables[2], variables[3], variables[4]],
    };
    fakeData(table, [], 0, 0);
    table.data.isLoaded = true;
    setPxTable(table);
  };

  const drawerFilter = (
    <>
      <select
        name="tabid"
        id="tabid"
        onChange={(e) => setTableid(e.target.value)}
      >
        <option value="TAB638">TAB638</option>
        <option value="TAB1292">TAB1292</option>
        <option value="TAB5659">TAB5659</option>
        <option value="TAB1128">TAB1128 (LARGE)</option>
      </select>
      <Button variant="tertiary" onClick={() => getTable(tableid)}>
        Get table
      </Button>
      <Button variant="tertiary" onClick={() => getFakeTable()}>
        Get fake table
      </Button>
      <div className={styles.variableBoxContainer}>
        {/* TODO: I think the warning in the console about unique IDs is the variable.id below*/}
        {pxTableMetaToRender &&
          pxTableMetaToRender.variables.length > 0 &&
          pxTableMetaToRender.variables.map(
            (variable) =>
              variable.id && (
                <VariableBox
                  id={variable.id}
                  tableId={pxTableMetaToRender.id}
                  label={variable.label}
                  mandatory={variable.mandatory}
                  values={variable.values}
                  codeLists={variable.codeLists}
                  selectedValues={selectedVBValues}
                  onChangeCodeList={handleCodeListChange}
                  onChangeMixedCheckbox={handleMixedCheckboxChange}
                  onChangeCheckbox={handleCheckboxChange}
                />
              )
          )}
      </div>
    </>
  );
  const drawerView = <>View content</>;
  const drawerEdit = <>Edit content</>;
  const drawerSave = <>Save content</>;
  const drawerHelp = <>Help content</>;

  return (
    <>
      <Header />
      <div className={styles.main}>
        <div className={styles.desktopNavigation}>
          <NavigationRail
            onChange={changeSelectedNavView}
            selected={selectedNavigationView}
          />
          {selectedNavigationView !== 'none' && (
            <NavigationDrawer
              heading="Filtrer"
              onClose={() => {
                setSelectedNavigationView('none');
              }}
            >
              {selectedNavigationView === 'filter' && drawerFilter}
              {selectedNavigationView === 'view' && drawerView}
              {selectedNavigationView === 'edit' && drawerEdit}
              {selectedNavigationView === 'save' && drawerSave}
              {selectedNavigationView === 'help' && drawerHelp}
            </NavigationDrawer>
          )}
        </div>
        <div className={styles.mobileNavigation}>
          <NavigationBar
            onChange={changeSelectedNavView}
            selected={selectedNavigationView}
          />
        </div>
        <Content topLeftBorderRadius={selectedNavigationView === 'none'}>
          {pxTable?.data?.isLoaded && (
            <div>
              <Table pxtable={pxTable} />
            </div>
          )}
          {pxData && <div dangerouslySetInnerHTML={{ __html: pxData }} />}
        </Content>
      </div>
    </>
  );
}

export default App;
