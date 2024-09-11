import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function RouterError() {
  const { t } = useTranslation();
  const error: unknown = useRouteError();

  let errorTitle = '';
  let errorMessage = '';

  // the response json is automatically parsed to
  // `error.data`, you also have access to the status
  if (isRouteErrorResponse(error) && error.status === 401) {
    console.warn('Router: 401 error', error);

    errorTitle = t('common.routing_errors.401.title');
    errorMessage = t('common.routing_errors.401.description');
  }
  if (isRouteErrorResponse(error) && error.status === 404) {
    console.warn('Router: 404 error', error);

    errorTitle = t('common.routing_errors.404.title');
    errorMessage = t('common.routing_errors.404.description');
  }
  if (isRouteErrorResponse(error) && error.status === 500) {
    console.warn('Router: 500 error', error);

    errorTitle = t('common.routing_errors.500.title');
    errorMessage = t('common.routing_errors.500.description');
  }

  if (errorTitle && errorMessage) {
    return (
      <div>
        <h1>{errorTitle}</h1>
        <p>{errorMessage}</p>
      </div>
    );
  }

  // rethrow to let the parent error boundary handle it
  // when it's not a special case for this route
  throw error;
}

export default RouterError;
