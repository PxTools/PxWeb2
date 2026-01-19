import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import { BodyLong, Heading, Link, VariableDefinition } from '@pxweb2/pxweb2-ui';
import classes from './Metadata.module.scss';

interface MetadataProps {
  readonly variablesDefinitions?: VariableDefinition[];
}

export function Metadata({ variablesDefinitions }: MetadataProps) {
  const { t } = useTranslation();

  if (!variablesDefinitions || variablesDefinitions.length === 0) {
    return null;
  }

  return (
    <>
      {variablesDefinitions && variablesDefinitions.length > 0 && (
        <div className={cl(classes.metadataContainer)}>
          <div className={cl(classes.metadataHeader)}>
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
          </div>

          {variablesDefinitions.map((variable) => (
            <div
              key={variable.variableName}
              className={cl(classes.variableLinkGroup)}
            >
              <Heading size="xsmall" level="2" spacing={true}>
                {variable.variableName}
              </Heading>

              <div className={cl(classes.linkGroupWrapper)}>
                {variable.links.map((link, index) => (
                  <div
                    key={`${link.href}-${index}`}
                    className={cl(classes.linkWrapper)}
                  >
                    <Link
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      icon="FileText"
                      iconPosition="start"
                    >
                      {link.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
