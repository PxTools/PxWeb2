import { useEffect, useState } from 'react';

const ICON_MAP_URL = `./icons/topicIconMap.json?v=${__BUILD_DATE__}`;
const ICON_BASE_PATH = './icons/topic';

export type TopicIconComponents = {
  id: string;
  fileName: string;
  small: React.ReactNode;
  medium: React.ReactNode;
}[];

export function useTopicIcons(): TopicIconComponents {
  const [icons, setIcons] = useState<TopicIconComponents>([]);

  useEffect(() => {
    fetch(ICON_MAP_URL)
      .then((res) => res.json())
      .then((data: Record<string, string>) => {
        const components: TopicIconComponents = Object.entries(data).map(
          ([id, fileName]) => ({
            id,
            fileName,
            medium: <img src={`${ICON_BASE_PATH}/${fileName}`} alt="" />,
            small: <img src={`${ICON_BASE_PATH}/small/${fileName}`} alt="" />,
          }),
        );
        setIcons(components);
      })
      .catch((err) => console.error('Kunne ikke laste ikon-mapping:', err));
  }, []);

  return icons;
}
