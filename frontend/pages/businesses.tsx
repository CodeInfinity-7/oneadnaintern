import { useEffect, useState } from 'react';

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('api/businesses') // full URL to Express
      .then((res) => res.json())
      .then((data) => {
        setBusinesses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching businesses:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (businesses.length === 0) return <p>No businesses yet</p>;

  return (
    <div>
      <h1>Businesses</h1>
      <ul>
        {businesses.map((biz) => (
          <li key={biz.id}>{biz.name}</li>
        ))}
      </ul>
    </div>
  );
}
