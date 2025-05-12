import React, { useEffect, useState } from 'react';

type Props = {
  topicId?: string;
  size?: 'small' | 'medium';
};

const ICON_MAP_URL = '/icons/topicIconMap.json';
const ICON_BASE_PATH = '/icons/topic/';
const ICON_SMALL_BASE_PATH = '/icons/topic/small/';

export const TopicIcon: React.FC<Props> = ({ topicId, size }) => {
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
      src={`${size === 'small' ? ICON_SMALL_BASE_PATH : ICON_BASE_PATH}${iconMap[topicId]}`}
      alt=""
    />
  );
};

export default TopicIcon;
