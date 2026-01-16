import cl from 'clsx';
import { useNavigate } from 'react-router';

import classes from './ErrorAction.module.scss';
import { ErrorMessageProps } from '../types';
import { Button } from '@pxweb2/pxweb2-ui';

interface ErrorActionProps extends Pick<
  ErrorMessageProps,
  'action' | 'actionText' | 'align'
> {}

export function ErrorAction({ action, actionText, align }: ErrorActionProps) {
  const navigate = useNavigate();

  return (
    <>
      {action === 'button' ? (
        <Button variant="primary" size="medium" onClick={() => navigate(0)}>
          {actionText}
        </Button>
      ) : (
        <button
          onClick={() => navigate(-1)}
          className={cl(
            classes.link,
            align === 'center' ? classes.alignCenter : classes.alignStart,
          )}
          type="button"
        >
          {actionText}
        </button>
      )}
    </>
  );
}
