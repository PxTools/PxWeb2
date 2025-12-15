import { useParams } from 'react-router';

export default function SavedQueryReroute() {
  const { sqId } = useParams<{ sqId: string }>();

  return (
    <div className="container">
      <h1>Saved Query</h1>
      <p>Saved query id: {sqId}</p>
    </div>
  );
}
