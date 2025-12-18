import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
  OpenAPI,
  SavedQueriesService,
  type SavedQueryResponse,
} from '@pxweb2/pxweb2-api-client';
import { getConfig } from '../../util/config/getConfig';

export default function SavedQueryReroute() {
  const { sqId } = useParams<{ sqId: string }>();
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'error' | 'success'
  >('idle');
  const [data, setData] = useState<SavedQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const config = getConfig();
    OpenAPI.BASE = config.apiUrl;
  }, []);

  useEffect(() => {
    if (!sqId) {
      return;
    }
    setStatus('loading');
    setError(null);
    SavedQueriesService.getSaveQuery(sqId)
      .then((res) => {
        setData(res);
        setStatus('success');
      })
      .catch((e) => {
        setError(e?.message ?? 'Failed to load saved query');
        setStatus('error');
      });
  }, [sqId]);

  return (
    <div className="container">
      <h1>Saved Query</h1>
      <p>Saved query id: {sqId}</p>
      {status === 'loading' && <p>Loading…</p>}
      {status === 'error' && <p role="alert">{error}</p>}
      {status === 'success' && (
        <div>
          <p>Loaded saved query: {data?.id}</p>
        </div>
      )}
    </div>
  );
}
