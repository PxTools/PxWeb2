import { Table } from 'packages/pxweb2-api-client/src';
import { getConfig } from '../config/getConfig';
import { getLanguagePath } from '../language/getLanguagePath';

export function createTableListSEO(tables: Table[], language: string) {
  const config = getConfig();

  // Build JSON-LD ItemList with absolute URLs to reduce DOM overhead
  const itemListElement = tables.map((table, index) => {
    const tablePath = getLanguagePath(
      `/table/${table.id}`,
      language,
      config.language.supportedLanguages,
      config.language.defaultLanguage,
      config.language.showDefaultLanguageInPath,
      config.baseApplicationPath,
      config.language.positionInPath,
    );

    const absoluteUrl = globalThis.window
      ? new URL(tablePath, globalThis.window.location.origin).href
      : tablePath;

    return {
      '@type': 'ListItem',
      position: index + 1,
      name: table.label,
      url: absoluteUrl,
    };
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement,
  };

  return (
    <script type="application/ld+json" id="seo-table-list-jsonld">
      {JSON.stringify(jsonLd)}
    </script>
  );
}
