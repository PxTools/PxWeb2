import { useTranslation } from 'react-i18next';

import { Heading, BodyLong, Link } from '@pxweb2/pxweb2-ui';

interface MetadataProps {
  readonly variablesDefinitions?: string[];
}

export function Metadata({ variablesDefinitions }: MetadataProps) {
  const { t } = useTranslation();

  if (!variablesDefinitions || variablesDefinitions.length === 0) {
    return null;
  }

  return (
    <>
      {variablesDefinitions && variablesDefinitions.length > 0 && (
        <div>
          <Heading level={'3'} size="small">
            {t(
              'presentation_page.main_content.about_table.definitions.metadata.title',
            )}
          </Heading>
          <BodyLong size="medium">
            {t(
              'presentation_page.main_content.about_table.definitions.metadata.description',
            )}
          </BodyLong>
          <ul>
            {variablesDefinitions.map((variable) => (
              // TODO: Add proper variable handling here, this is temporary
              <li key={variable}>
                <Link href="#">{variable}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
