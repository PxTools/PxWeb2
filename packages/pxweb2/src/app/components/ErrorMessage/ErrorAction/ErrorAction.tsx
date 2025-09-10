import cl from 'clsx';
import { Link as LinkRouter, useNavigate } from 'react-router';

import classes from './ErrorAction.module.scss';
import { ErrorMessageProps } from '../ErrorMessage';
import { Button } from '@pxweb2/pxweb2-ui';

interface ErrorActionProps extends Pick<ErrorMessageProps, 'action'> {
  actionText: string;
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
        // TODO: Fix this! Needs proper path in "to"
        <LinkRouter to="/" className={cl(classes.link)}>
          {actionText}
        </LinkRouter>
        // TODO: If using our Link component from the design system:
        // we do not need the CSS for this component
        // <Link href="/" inline>
        //   {actionText}
        // </Link>
      )}
    </>
  );
}
