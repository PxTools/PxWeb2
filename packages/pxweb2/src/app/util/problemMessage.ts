import { ApiError, Problem } from 'packages/pxweb2-api-client/src';

// This function is used to create a message for the user when an error occurs.
// It takes an ApiError object and an optional selectedTabId string as parameters.
// The function extracts the status, title, and type from the Problem object
// contained in the ApiError object and constructs a message string.
// The message includes the status, selectedTabId (if provided), title, and type.
// The function returns the constructed message string.
// "status selectedTabId title type"
// For example: "404 TableId: tab638 Not Found https://example.com/problem"

export function problemMessage(
  apiError: ApiError,
  selectedTabId?: string,
): string {
  const problem: Problem = apiError.body as Problem;

  return `${problem?.status}
          ${selectedTabId ? `TableId: ${selectedTabId} ` : ''}
          ${problem?.title}
           - ${problem?.type}`;
}
