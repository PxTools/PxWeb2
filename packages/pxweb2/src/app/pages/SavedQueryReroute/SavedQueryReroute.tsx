import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  OpenAPI,
  SavedQueriesService,
  type SavedQueryResponse,
} from '@pxweb2/pxweb2-api-client';
import { getConfig } from '../../util/config/getConfig';

export default function SavedQueryReroute() {
  const { sqId } = useParams<{ sqId: string }>();
  const navigate = useNavigate();
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

  // Navigate to the table viewer when the saved query has loaded
  useEffect(() => {
    if (status !== 'success' || !data) {
      return;
    }
    const config = getConfig();
    const lang = data.language || data.savedQuery.language;
    const defaultLang = config.language.defaultLanguage;
    const showDefaultLanguageInPath = config.language.showDefaultLanguageInPath;

    const path = showDefaultLanguageInPath
      ? `/${lang}/table/${data.savedQuery.tableId}`
      : lang === defaultLang
        ? `/table/${data.savedQuery.tableId}`
        : `/${lang}/table/${data.savedQuery.tableId}`;

    navigate(path, { replace: true });
  }, [status, data, navigate]);

  return (
    <div className="container">
      <h1>Saved Query</h1>
      <p>Saved query id: {sqId}</p>
      {status === 'loading' && <p>Loading…</p>}
      {status === 'error' && <p role="alert">{error}</p>}
      {status === 'success' && (
        <div>
          <p>Table id: {data?.savedQuery.tableId}</p>
        </div>
      )}
    </div>
  );
}
