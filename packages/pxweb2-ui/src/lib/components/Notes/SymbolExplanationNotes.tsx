import { useTranslation } from 'react-i18next';

import { InformationCard } from '../InformationCard/InformationCard';
import BodyLong from '../Typography/BodyLong/BodyLong';

export type SymbolExplanationNotesProps = {
  readonly notes: { [key: string]: string };
};

export function SymbolExplanationNotes({ notes }: SymbolExplanationNotesProps) {
  const { t } = useTranslation();
  const heading = t(
    'presentation_page.main_content.about_table.footnotes.symbol_explanation_heading',
  );

  return (
    <InformationCard icon="Book" headingText={heading} headingLevel="1">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          paddingTop: '8px',
          alignItems: 'flex-start',
          alignSelf: 'stretch',
        }}
      >
        {Object.entries(notes).map(([key, value]) => (
          <div key={key}>
            <BodyLong>{value}</BodyLong>
          </div>
        ))}
      </div>
    </InformationCard>
  );
}
