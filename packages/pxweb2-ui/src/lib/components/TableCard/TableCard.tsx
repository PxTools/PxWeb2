import React, { type ReactNode } from 'react';
import cl from 'clsx';
import styles from './TableCard.module.scss';
import Heading from '../Typography/Heading/Heading';
import BodyShort from '../Typography/BodyShort/BodyShort';

interface TableCardProps {
  tableId?: string;
  title?: string;
  icon?: ReactNode;
  period?: string;
  frequency?: string;
  lastUpdated?: string;
  status?: string;
}

export const TableCard: React.FC<TableCardProps> = ({
  icon,
  tableId,
  title,
  period,
  frequency,
  lastUpdated,
  status = 'active',
}) => (
  <div className={cl(styles.tableCard)}>
    {icon && <div className={cl(styles[`iconWrapper-${status}`])}>{icon}</div>}
    <div className={cl(styles.cardContent)}>
      <Heading size="small" level="2">
        {title}
      </Heading>
      <div className={cl(styles.tableMeta)}>
        {period && (
          <BodyShort className={cl(styles.period)}>{period}</BodyShort>
        )}
        {frequency && (
          <BodyShort className={cl(styles.frequency)}>{frequency}</BodyShort>
        )}
        {lastUpdated && (
          <BodyShort className={cl(styles.lastUpdated)}>
            {lastUpdated}
          </BodyShort>
        )}
        {tableId && <span className={cl(styles.tableId)}>{tableId}</span>}
      </div>
    </div>
  </div>
);

export default TableCard;
