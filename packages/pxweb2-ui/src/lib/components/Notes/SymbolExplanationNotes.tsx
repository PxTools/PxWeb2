import { useTranslation } from 'react-i18next';
import { InformationCard } from '../InformationCard/InformationCard';
import styles from './Notes.module.scss';
import BodyLong from '../Typography/BodyLong/BodyLong';
import cl from 'clsx';

export type SymbolExplanationNotesProps = {
  readonly notes: { [key: string]: string };
};

export function SymbolExplanationNotes({ notes }: SymbolExplanationNotesProps) {
  const { t } = useTranslation();
  const heading = t(
    'presentation_page.main_content.about_table.footnotes.symbol_explanation_heading',
  );

  return (
    <InformationCard icon="Book" headingText={heading} headingLevel="3">
      <BodyLong
        as="div"
        className={cl(styles['symbolexplanationnotes'])}
        size="medium"
      >
        {Object.entries(notes).map(([key, value]) => (
          <div key={key}>{value}</div>
        ))}
      </BodyLong>
    </InformationCard>
  );
}
