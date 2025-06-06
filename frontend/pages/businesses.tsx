'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

interface Business {
  id: number;
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  kycFiles?: string[]; // <- THIS must be present
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const fetchBusinesses = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Unauthorized! Please login.');
      router.push('/login');
      return;
    }
   ;

    console.log('Using token:', token);

    try {
      const res = await fetch(
        `http://localhost:4000/businesses?page=${page}&limit=${limit}&search=${search}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        console.error('Failed to fetch businesses. Status:', res.status);
        toast.error('Failed to fetch businesses');
        return;
      }

      const json = await res.json();
       console.log('Fetched businesses:', JSON.stringify(json.data, null, 2))
      console.log('Fetched businesses:', json);
      setBusinesses(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Something went wrong while fetching data');
    }
  }, [page,limit, search, router]);

  useEffect(() => {
    console.log('Calling fetchBusinesses');
    fetchBusinesses();
  }, [fetchBusinesses]);
  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const totalPages = Math.ceil(total / limit);

  return (
  <div className="min-vh-100 py-5" style={{ backgroundColor: '#f8f8ff' }}>
    <div className="container">

      {/* Heading and Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary-custom border-bottom border-3 pb-2 border-primary-custom">
          All Businesses
        </h1>

        <div className="d-flex gap-2">
          <button
            onClick={() => router.push('/form')}
            className="btn btn-primary-custom rounded-pill px-4 py-2"
          >
            + Add Business
          </button>
          <button
            onClick={() => router.push('/employees')}
            className="btn btn-primary-custom rounded-pill px-4 py-2"
          >
            View All Employees
          </button>
          <button className="btn btn-primary-custom rounded-pill px-4 py-2" onClick={handleLogout}>
              Logout
            </button>
        </div>
      </div>

      {/* Continue with rest of your page... */}

        

        {/* Search Bar */}
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
      <div className="d-flex flex-wrap gap-2 mt-3">

  {b.kycfiles && b.kycfiles.length > 0 ? (
  b.kycfiles.map((file, idx) => (
    <a
      key={idx}
      href={`http://localhost:4000/${file}`}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-sm btn-outline-success"
    >
      View KYC {idx + 1}
    </a>
  ))
) : (
  <button
    onClick={() => router.push(`/kyc?id=${b.id}`)}
  className="btn btn-sm btn-outline-dark"
   
  >
    Upload KYC
  </button>
)} 
 {/* View Employees Button */}
                      <button
  onClick={() => router.push(`/employees?business_id=${b.id}`)}
  className="btn btn-sm btn-outline-dark"
>
  View Employees
</button>
</div>



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
