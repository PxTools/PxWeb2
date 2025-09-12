import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Heading,
  BodyLong,
  Link,
  DetailsSection,
  IconProps,
} from '@pxweb2/pxweb2-ui';

type DetailLink = {
  text: string;
  url: string;
  icon?: IconProps['iconName'];
};

type DetailBlock = {
  header?: string;
  text?: string;
  links?: DetailLink[];
};

type StartpageDetailsSection = {
  enabled?: boolean;
  detailHeader?: string;
  detailContent?: DetailBlock[];
};

type StartpageContent = {
  detailsSection?: StartpageDetailsSection;
};

async function fetchStartpage(lang: string): Promise<StartpageContent | null> {
  try {
    const res = await fetch(`/startpage/startpage-${lang}.json`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as StartpageContent;
  } catch {
    return null;
  }
}

export default function StartpageDetails() {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<StartpageContent | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await fetchStartpage(i18n.language);
      if (alive) {
        setContent(data);
      }
    })();
    return () => {
      alive = false;
    };
  }, [i18n.language]);

  const ds = content?.detailsSection;
  if (!ds || ds.enabled === false) {
    return null;
  }

  return (
    <DetailsSection header={ds.detailHeader ?? 'Mer informasjon'}>
      <>
        {(ds.detailContent ?? []).map((block, idx) => (
          <div className="details-section" key={idx}>
            {block.header && <Heading size="xsmall">{block.header}</Heading>}
            {block.text && <BodyLong>{block.text}</BodyLong>}
            {block.text && <br />}
            {block.links && block.links.length > 0 && (
              <>
                <Heading size="xsmall">Relevante lenker</Heading>
                {block.links.map((link, i) => (
                  <div key={i}>
                    <Link
                      href={link.url}
                      icon={link.icon}
                      iconPosition="left"
                      size="medium"
                    >
                      {link.text}
                    </Link>
                    <br />
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </>
    </DetailsSection>
  );
}
