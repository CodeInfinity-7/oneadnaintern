'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Business {
  id: number;
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const fetchBusinesses = async () => {
    const res = await fetch(
      `http://localhost:4000/businesses?page=${page}&limit=${limit}&search=${search}`
    );
    const data = await res.json();
    setBusinesses(data.businesses || []);
    setTotal(data.total || 0);
  };

  useEffect(() => {
    fetchBusinesses();
  }, [page, search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: '#f8f8ff' }}>
      <div className="container">

        {/* Heading and Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary-custom border-bottom border-3 pb-2 border-primary-custom">
            All Businesses
          </h1>
          <button
            onClick={() => router.push('/form')}
            className="btn btn-primary-custom rounded-pill px-4 py-2"
          >
            + Add Business
          </button>
        </div>

        {/* ✅ Properly Positioned Search Bar */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control form-control-lg border border-primary"
              placeholder="Search businesses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Business Cards */}
        <div className="row g-4">
          {businesses.map((b) => (
            <div className="col-md-6" key={b.id}>
              <div className="card h-100 border border-primary-custom shadow-sm">
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
                  <p className="card-text">
                    <strong className="text-primary-custom">Address:</strong> {b.address}
                  </p>
                  <button className="btn btn-outline-primary-custom mt-2">
                    Upload KYC
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
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
            disabled={page >= totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
