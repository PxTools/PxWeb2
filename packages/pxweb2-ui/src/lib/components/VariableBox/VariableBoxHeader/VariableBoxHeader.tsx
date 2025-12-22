import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './VariableBoxHeader.module.scss';
import { Icon } from '../../Icon/Icon';
import Tag from '../../Tag/Tag';
import { VariableBoxProps } from '../VariableBox';
import LocalAlert from '../../LocalAlert/LocalAlert';
import Heading from '../../Typography/Heading/Heading';

type VariableBoxPropsToHeader = Pick<VariableBoxProps, 'label' | 'mandatory'>;

type VariableBoxHeaderProps = VariableBoxPropsToHeader & {
  totalValues: number;
  totalChosenValues: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  varId: string;
  className?: string;
  isMissingMandatoryValues?: boolean;
};

export function VariableBoxHeader({
  label,
  mandatory,
  totalValues,
  totalChosenValues,
  isOpen,
  setIsOpen,
  varId,
  className = '',
  isMissingMandatoryValues = false,
}: VariableBoxHeaderProps) {
  const { t } = useTranslation();
  const cssClasses = className.length > 0 ? ' ' + className : '';

  function handleHeaderClick() {
    setIsOpen(!isOpen);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Prevent scrolling with spacebar

      setIsOpen(!isOpen);
    }
  }

  const titleId = 'title-' + varId;
  const tagsId = 'tags-' + varId;
  const alertId = 'mandatory-alert-' + varId;

  return (
    <div
      className={cl(
        classes['variablebox-header'],
        isOpen && classes['variablebox-header-isopen'],
      )}
      onClick={handleHeaderClick}
      onKeyDown={(e) => handleKeyDown(e)}
    >
      <div className={cl(classes['header-content'])}>
        <div className={cl(classes['header-title-and-tag'])}>
          <Heading
            id={titleId}
            level="3"
            className={cl(classes['header-title'], classes['heading-small'])}
          >
            {label}
          </Heading>
          <div id={tagsId} className={cl(classes['header-tags'])}>
            <Tag variant="neutral">
              {t(
                'presentation_page.side_menu.selection.variablebox.header.tag_selected',
                {
                  selected: t('number.simple_number_with_zero_decimal', {
                    value: totalChosenValues,
                  }),
                  total: t('number.simple_number_with_zero_decimal', {
                    value: totalValues,
                  }),
                },
              )}
            </Tag>
            {mandatory && (
              <Tag variant="info">
                {t(
                  'presentation_page.side_menu.selection.variablebox.header.tag_mandatory',
                )}
              </Tag>
            )}
          </div>
        </div>

        <button
          className={cl(classes['variablebox-header-button']) + cssClasses}
          aria-expanded={isOpen}
          aria-labelledby={
            titleId +
            ' ' +
            tagsId +
            ' ' +
            (isMissingMandatoryValues ? alertId : '')
          }
        >
          {isOpen ? (
            <Icon iconName="ChevronUp"></Icon>
          ) : (
            <Icon iconName="ChevronDown"></Icon>
          )}
        </button>
      </div>

      {isMissingMandatoryValues && (
        <div className={cl(classes['header-alert'])} role="alert">
          <LocalAlert variant="error" size="small" id={alertId}>
            {t(
              'presentation_page.side_menu.selection.variablebox.header.alert_no_mandatory_values',
            )}
          </LocalAlert>
        </div>
      )}
    </div>
  );
}

export default VariableBoxHeader;
