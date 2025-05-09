import React, { useEffect, useState } from 'react';

type Props = {
  topicId?: string;
};

const ICON_MAP_URL = '/icons/topicIcons/subjectIconMap.json';
const ICON_BASE_PATH = '/icons/topicIcons/';

export const TopicIcon: React.FC<Props> = ({ topicId }) => {
  const [iconMap, setIconMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchIconMap = async () => {
      try {
        const response = await fetch(ICON_MAP_URL);
        const data = await response.json();
        setIconMap(data);
      } catch (error) {
        console.error('Kunne ikke laste ikon-mapping:', error);
      }
    };

    fetchIconMap();
  }, []);

  if (!topicId || !iconMap[topicId]) {
    return null;
  }

  return (
    <img
      src={`${ICON_BASE_PATH}${iconMap[topicId]}`}
      alt=""
      width={32}
      height={32}
    />
  );
};

export default TopicIcon;
