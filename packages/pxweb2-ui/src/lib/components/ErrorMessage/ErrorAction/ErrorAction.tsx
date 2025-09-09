import { Link as LinkRouter } from 'react-router';

import { ErrorMessageProps } from '../ErrorMessage';
import { Button } from '@pxweb2/pxweb2-ui';

interface ErrorActionProps extends Pick<ErrorMessageProps, 'action'> {
  actionText: string;
}

export function ErrorAction({ action, actionText }: ErrorActionProps) {
  if (!action) {
    return null;
  }

  return (
    <>
      {action === 'button' ? (
        //TODO: reload page
        <Button
          variant="primary"
          size="medium"
          onClick={() => window.location.reload()}
        >
          {actionText}
        </Button>
      ) : (
        //TODO: go back to previous page
        //<LinkRouter to={/*() => window.history.back()*/}> TODO: Fix this!
        <LinkRouter to="">{actionText}</LinkRouter>
      )}
    </>
  );
}
