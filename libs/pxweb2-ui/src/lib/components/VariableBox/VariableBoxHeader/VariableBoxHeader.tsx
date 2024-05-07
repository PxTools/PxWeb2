import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './VariableBoxHeader.module.scss';
import { Icon } from '../../Icon/Icon';
import Tag from '../../Tag/Tag';
import Heading from '../../Typography/Heading/Heading';
import { VariableBoxProps } from '../VariableBox';

/* eslint-disable-next-line */
type VariableBoxPropsToHeader = Pick<VariableBoxProps, 'label' | 'mandatory'>;

type VariableBoxHeaderProps = VariableBoxPropsToHeader & {
  totalValues: number;
  totalChosenValues: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  tabIndex?: number;
};

export function VariableBoxHeader({
  label,
  mandatory,
  totalValues,
  totalChosenValues,
  isOpen,
  setIsOpen,
  tabIndex = 0,
}: VariableBoxHeaderProps) {
  const { t } = useTranslation();

  function handleHeaderClick() {
    setIsOpen(!isOpen);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      setIsOpen(!isOpen);
    }
  }

  return (
    <div
      className={cl(
        classes['variablebox-header'],
        isOpen && classes['variablebox-header-isopen']
      )}
      onClick={handleHeaderClick}
      onKeyDown={(e) => handleKeyDown(e)}
      tabIndex={tabIndex}
    >
      <div className={cl(classes['header-title-and-tag'])}>
        {/* TODO: Is this the right level for Heading here? */}
        <Heading level="3" className={cl(classes['header-title'])} size="small">
          {label}
        </Heading>
        <div className={cl(classes['header-tags'])}>
          <Tag variant="success">
            {t(
              'presentation_page.sidemenu.selection.variablebox.header.tag_selected',
              {
                selected: t('number.simple_number_with_zero_decimal', {
                  value: totalChosenValues,
                }),
                total: t('number.simple_number_with_zero_decimal', {
                  value: totalValues,
                }),
              }
            )}
          </Tag>
          {mandatory && (
            <Tag variant="info">
              {t(
                'presentation_page.sidemenu.selection.variablebox.header.tag_mandatory'
              )}
            </Tag>
          )}
        </div>
      </div>

      <div className={cl(classes['header-icon'])}>
        {isOpen ? (
          <Icon iconName="ChevronUp"></Icon>
        ) : (
          <Icon iconName="ChevronDown"></Icon>
        )}
      </div>
    </div>
  );
}

export default VariableBoxHeader;
