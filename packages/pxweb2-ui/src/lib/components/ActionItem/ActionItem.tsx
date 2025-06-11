import cl from 'clsx';

import styles from './ActionItem.module.scss';
//import { Icon, {IconProps} } from '../Icon/Icon';
import { BodyShort, Icon, IconProps, Label } from '@pxweb2/pxweb2-ui';
import { useTranslation } from 'react-i18next';
//import classes from './Alert.module.scss';

//import { Checkox} from '../CheckBox/CheckBox';

interface ActionItemProps {
  ariaLabel?: string;
  icon: IconProps['iconName'];
  onClick?: () => void;
  description?: string;
  checked?: boolean;
  size?: 'medium' | 'large';
}

export function ActionItem({
  ariaLabel = '',
  icon = 'BarChart',
  onClick,
  //checked = false,
  size = 'medium',
  description = 'Here is a description of the action item.',
}: Readonly<ActionItemProps>) {
  const { t } = useTranslation();

  // return (
  //   <div
  //     className={cl(styles.actionItem)}
  //     role="button"
  //     tabIndex={0}
  //     aria-label={ariaLabel || t('actionItem.ariaLabel')}
  //   >
  //     <div  className={cl(styles[`iconWrapper-${size}`],styles.iconWrapper) } >
  //         <Icon iconName={icon} className={styles.icon} />
  //     </div>
  //     <div>
  //        <div className={styles.labelBodyWrapper}>
  //       <Label className={cl(styles[`label`])}>
  //         {ariaLabel || t('actionItem.label')}
  //       </Label>
  //       {size === 'large' && (
  //         <BodyShort className={styles.bodyShort}>
  //           {description || t('actionItem.bodyShort')}
  //         </BodyShort>
  //       )}
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div
      className={cl(styles.actionItem)}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || t('actionItem.ariaLabel')}
      onClick={onClick}
    >
      <div className={cl(styles[`iconWrapper-${size}`], styles.iconWrapper)}>
        <Icon iconName={icon} className={styles.icon} />
      </div>
      <div className={styles.labelBodyWrapper}>
        <Label
          security="medium"
          className={cl(styles[`label-${size}`], styles.label)}
        >
          {ariaLabel || t('actionItem.label')}
        </Label>
        {size === 'medium' && (
          <BodyShort className={styles.bodyShort}>
            {description || t('actionItem.bodyShort')}
          </BodyShort>
        )}
      </div>
    </div>
  );
}
