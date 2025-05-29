'use client';
interface Business {
  id: number;
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
}
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BusinessListPage() {
 
   const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;

  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:4000/businesses')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBusinesses(data);
        } else if (Array.isArray(data.data)) {
          setBusinesses(data.data);
        } else {
          setBusinesses([]);
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setBusinesses([]);
      });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredBusinesses = businesses.filter((b) => {
    const query = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(query) ||
      b.email.toLowerCase().includes(query) ||
      b.owner.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const paginatedBusinesses = filteredBusinesses.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleAddBusiness = () => {
    router.push('/form');
  };

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: '#f8f8ff' }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary-custom border-bottom border-3 pb-2 border-primary-custom">
            All Businesses
          </h1>
          <button onClick={handleAddBusiness} className="btn btn-primary-custom rounded-pill px-4 py-2">
            + Add Business
          </button>
        </div>

        <div className="row justify-content-center mb-4">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control form-control-lg border border-primary"
              placeholder="Search by name, email, or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {paginatedBusinesses.length === 0 ? (
          <p className="text-muted text-center">No businesses found.</p>
        ) : (
          <div className="row g-4">
  {paginatedBusinesses.map((b: Business) => (
              <div className="col-12 col-md-6" key={b.id}>
                <div className="card shadow-sm border border-primary-custom h-100">
                  <div className="card-body">
                    <h5 className="card-title text-primary-custom fw-semibold">{b.name}</h5>
                    <p className="card-text mb-1">
                      <strong className="text-primary-custom">Owner:</strong> {b.owner}
                    </p>
                    <p className="card-text mb-1">
                      <strong className="text-primary-custom">Email:</strong> {b.email}
                    </p>
                    <p className="card-text mb-1">
                      <strong className="text-primary-custom">Phone:</strong> {b.phone}
                    </p>
                    <p className="card-text mb-0">
                      <strong className="text-primary-custom">Address:</strong> {b.address}
                    </p>
                    <Link href={`/kyc?id=${b.id}`}>
                      <button className="btn btn-outline-primary-custom mt-2">Upload KYC</button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary"
          >
            Prev
          </button>
          <span className="fw-semibold text-primary-custom">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
