import type { SelectedVBValues } from '@pxweb2/pxweb2-ui';

export type ApiQueryInfoType = {
  getUrl: string;
  postUrl: string;
  postBody: string;
};

export function getApiQueryInfo(
  selectedVBValues: SelectedVBValues[],
): ApiQueryInfoType {
  console.log({ selectedVBValues });
  const apiQueryInfo: ApiQueryInfoType = {
    getUrl: 'https://api.pxweb2.test/getQueryExample',
    postUrl: 'https://api.pxweb2.test/postQueryExample',
    postBody: '{"query":[{"code":"region"}],}',
  };
  return apiQueryInfo;
}
