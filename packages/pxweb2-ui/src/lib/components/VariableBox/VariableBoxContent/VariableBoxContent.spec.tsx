import React from 'react';
import { render, screen, getAllByRole } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import VariableBoxContent from './VariableBoxContent';
import { VartypeEnum } from '../../../shared-types/vartypeEnum';

describe('VariableBoxContent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <VariableBoxContent
        label="test-1"
        languageDirection="ltr"
        type={VartypeEnum.REGULAR_VARIABLE}
        values={[{ code: 'test-1', label: 'test-1' }]}
        onChangeCodeList={() => {
          return;
        }}
        onChangeCheckbox={() => {
          return;
        }}
        onChangeMixedCheckbox={() => {
          return;
        }}
        addModal={() => {
          return;
        }}
        removeModal={() => {
          return;
        }}
        varId="test-1"
        selectedValues={[]}
        totalValues={1}
        totalChosenValues={0}
      />,
    );

    expect(baseElement).toBeTruthy();
  });

  it('should render values in order when the type is not time variable', () => {
    const { baseElement } = render(
      <VariableBoxContent
        label="test-1"
        languageDirection="ltr"
        type={VartypeEnum.REGULAR_VARIABLE}
        values={[
          { code: 'test-1', label: 'test-1' },
          { code: 'test-2', label: 'test-2' },
        ]}
        onChangeCodeList={() => {
          return;
        }}
        onChangeCheckbox={() => {
          return;
        }}
        onChangeMixedCheckbox={() => {
          return;
        }}
        addModal={() => {
          return;
        }}
        removeModal={() => {
          return;
        }}
        varId="test-1"
        selectedValues={[]}
        totalValues={2}
        totalChosenValues={0}
      />,
    );

    const renderedCheckboxes = getAllByRole(baseElement, 'checkbox');

    // Adds the select all checkbox when more than 1 value is present,
    // therefore check [1] and [2] instead of [0] and [1]
    expect(renderedCheckboxes[1]).toHaveTextContent('test-1');
    expect(renderedCheckboxes[2]).toHaveTextContent('test-2');
  });

  it('should render values in reverse order when the type is time variable', () => {
    const { baseElement } = render(
      <VariableBoxContent
        label="test-1"
        languageDirection="ltr"
        type={VartypeEnum.TIME_VARIABLE}
        values={[
          { code: 'test-1', label: 'test-1' },
          { code: 'test-2', label: 'test-2' },
        ]}
        onChangeCodeList={() => {
          return;
        }}
        onChangeCheckbox={() => {
          return;
        }}
        onChangeMixedCheckbox={() => {
          return;
        }}
        addModal={() => {
          return;
        }}
        removeModal={() => {
          return;
        }}
        varId="test-1"
        selectedValues={[]}
        totalValues={2}
        totalChosenValues={0}
      />,
    );

    const renderedCheckboxes = getAllByRole(baseElement, 'checkbox');

    // Adds the select all checkbox when more than 1 value is present,
    // therefore check [1] and [2] instead of [0] and [1]
    expect(renderedCheckboxes[1]).toHaveTextContent('test-2');
    expect(renderedCheckboxes[2]).toHaveTextContent('test-1');
  });
});

function renderVirtuosoItems(
  totalCount: number,
  itemContent: (index: number) => React.ReactNode,
) {
  return Array.from({ length: totalCount }).map((_, i) => {
    const content = itemContent(i);

    // Use index as key for test mock - simpler and sufficient for testing purposes
    return <div key={i}>{content}</div>;
  });
}

describe('With Virtuoso mock', () => {
  beforeAll(() => {
    vi.mock('react-virtuoso', () => {
      return {
        Virtuoso: ({
          totalCount,
          itemContent,
        }: {
          totalCount: number;
          itemContent: (index: number) => React.ReactNode;
        }) => (
          <div data-testid="mock-virtuoso">
            {renderVirtuosoItems(totalCount, itemContent)}
          </div>
        ),
      };
    });
  });

  afterAll(() => {
    vi.resetModules();
  });

  it('should set aria-labelledby to include codeListLabelId when codeLists are present', () => {
    render(
      <VariableBoxContent
        label="test"
        languageDirection="ltr"
        type={VartypeEnum.REGULAR_VARIABLE}
        values={[
          { code: 'test-1', label: 'test-1' },
          { code: 'test-2', label: 'test-2' },
          { code: 'test-3', label: 'test-3' },
          { code: 'test-4', label: 'test-4' },
          { code: 'test-5', label: 'test-5' },
          { code: 'test-6', label: 'test-6' },
          { code: 'test-7', label: 'test-7' },
          { code: 'test-8', label: 'test-8' },
        ]}
        codeLists={[
          {
            id: 'cl-1',
            label: 'CodeList 1',
            values: [{ code: 'test-1', label: 'test-1' }],
          },
        ]}
        onChangeCodeList={() => {
          return;
        }}
        onChangeCheckbox={() => {
          return;
        }}
        onChangeMixedCheckbox={() => {
          return;
        }}
        addModal={() => {
          return;
        }}
        removeModal={() => {
          return;
        }}
        varId="test-1"
        selectedValues={[]}
        totalValues={7}
        totalChosenValues={0}
      />,
    );

    const searchInput = screen.getByRole('textbox');

    expect(searchInput).toBeInTheDocument();

    // aria-labelledby should contain both title-varId and codelist-label-<uuid>
    const ariaLabelledBy = searchInput.getAttribute('aria-labelledby');
    expect(ariaLabelledBy).toMatch(/^title-test-1 codelist-label-/);
  });

  it('should set aria-labelledby to only title-varId when codeLists are not present', () => {
    render(
      <VariableBoxContent
        label="test-2"
        languageDirection="ltr"
        type={VartypeEnum.REGULAR_VARIABLE}
        values={[
          { code: 'test-1', label: 'test-1' },
          { code: 'test-2', label: 'test-2' },
          { code: 'test-3', label: 'test-3' },
          { code: 'test-4', label: 'test-4' },
          { code: 'test-5', label: 'test-5' },
          { code: 'test-6', label: 'test-6' },
          { code: 'test-7', label: 'test-7' },
        ]}
        codeLists={[]}
        onChangeCodeList={() => {
          return;
        }}
        onChangeCheckbox={() => {
          return;
        }}
        onChangeMixedCheckbox={() => {
          return;
        }}
        addModal={() => {
          return;
        }}
        removeModal={() => {
          return;
        }}
        varId="test-2"
        selectedValues={[]}
        totalValues={7}
        totalChosenValues={0}
      />,
    );

    const searchInput = screen.getByRole('textbox');

    // aria-labelledby should only contain title-varId
    expect(searchInput).toHaveAttribute('aria-labelledby', 'title-test-2');
  });
});
