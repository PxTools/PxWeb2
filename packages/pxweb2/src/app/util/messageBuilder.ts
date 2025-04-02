import { ApiError, Problem } from 'packages/pxweb2-api-client/src';


export function problemMessage(apiError: ApiError, selectedTabId: string): string {

  const problem: Problem = apiError.body as Problem;

    return (
      problem?.status +
      ' ' +
      'TableId: ' +
      selectedTabId +
      ' ' +
      problem?.title +
      ' ' +
      problem?.type
    );
  }
