import cl from 'clsx';
import { useNavigate } from 'react-router';

import classes from './ErrorAction.module.scss';
import { ErrorMessageProps } from '../types';
import { Button } from '@pxweb2/pxweb2-ui';

interface ErrorActionProps extends Pick<ErrorMessageProps, 'action'> {
  readonly actionText: string;
}

export function ErrorAction({ action, actionText }: ErrorActionProps) {
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
          className={cl(classes.link)}
          type="button"
        >
          {actionText}
        </button>
      )}
    </>
  );
}
