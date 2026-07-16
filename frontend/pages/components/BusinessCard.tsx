'use client';
import { useRouter } from 'next/router';

interface Props {
  id: number;
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  kycFiles?: string[];
}

export default function BusinessCard({
  id,
  name,
  owner,
  email,
  phone,
  address,
  kycFiles = [],
}: Props) {
  const router = useRouter();

  return (
    <div className="card h-100 border border-primary-custom shadow-sm" role="article">
      <div className="card-body">
        <h5 className="card-title text-primary-custom fw-semibold">{name}</h5>
        <p className="card-text mb-1"><strong>Business ID:</strong> {id}</p>
        <p className="card-text mb-1"><strong>Owner:</strong> {owner}</p>
        <p className="card-text mb-1"><strong>Email:</strong> {email}</p>
        <p className="card-text mb-1"><strong>Phone:</strong> {phone}</p>
        <p className="card-text"><strong>Address:</strong> {address}</p>

        <div className="d-flex flex-wrap gap-2 mt-3">
          {kycFiles.length > 0 ? (
            kycFiles.map((file, idx) => (
              <a
                key={idx}
                href={`/api/${file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-success"
              >
                View KYC {idx + 1}
              </a>
            ))
          ) : (
            <button
              className="btn btn-sm btn-outline-dark"
              onClick={() => router.push(`/kyc?id=${id}`)}
            >
              Upload KYC
            </button>
          )}
          <button
            className="btn btn-sm btn-outline-dark"
            onClick={() => router.push(`/employees?business_id=${id}`)}
          >
            View Employees
          </button>
        </div>
      </div>
    </div>
  );
}
