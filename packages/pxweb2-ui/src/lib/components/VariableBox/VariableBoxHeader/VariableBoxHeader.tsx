import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './VariableBoxHeader.module.scss';
import { Icon } from '../../Icon/Icon';
import Tag from '../../Tag/Tag';
import { VariableBoxProps } from '../VariableBox';
import Alert from '../../Alert/Alert';
import Heading from '../../Typography/Heading/Heading';

type VariableBoxPropsToHeader = Pick<VariableBoxProps, 'label' | 'mandatory'>;

type VariableBoxHeaderProps = VariableBoxPropsToHeader & {
  totalValues: number;
  totalChosenValues: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  tabIndex?: number;
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
  tabIndex = 0,
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
      setIsOpen(!isOpen);
    }
  }

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
            level="3"
            className={cl(classes['header-title'], classes['heading-small'])}
          >
            {label}
          </Heading>
          <div className={cl(classes['header-tags'])}>
            <Tag variant="neutral">
              {t(
                'presentation_page.sidemenu.selection.variablebox.header.tag_selected',
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
                  'presentation_page.sidemenu.selection.variablebox.header.tag_mandatory',
                )}
              </Tag>
            )}
          </div>
        </div>

        <div className={cssClasses} tabIndex={tabIndex}>
          {isOpen ? (
            <Icon iconName="ChevronUp"></Icon>
          ) : (
            <Icon iconName="ChevronDown"></Icon>
          )}
        </div>
      </div>

      {isMissingMandatoryValues && (
        <div className={cl(classes['header-alert'])} role="alert">
          <Alert variant="error" size="small">
            {t(
              'presentation_page.sidemenu.selection.variablebox.header.alert_no_mandatory_values',
            )}
          </Alert>
        </div>
      )}
    </div>
  );
}

export default VariableBoxHeader;
