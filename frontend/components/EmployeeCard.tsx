'use client';
import { useRouter } from 'next/router';

interface Props {
  id: number;
  full_name: string;
  designation: string;
  mobile: string;
  email: string;
  business_id: number;
  onDelete: (id: number) => void;
}

export default function EmployeeCard({
  id,
  full_name,
  designation,
  mobile,
  email,
  business_id,
  onDelete,
}: Props) {
  const router = useRouter();

  return (
    <div className="card h-100 border border-primary-custom shadow-sm" role="article">
      <div className="card-body">
        <h5 className="card-title text-primary-custom fw-semibold">{full_name}</h5>
        <p className="card-text mb-1"><strong>Business ID:</strong> {business_id}</p>
        <p className="card-text mb-1"><strong>Designation:</strong> {designation}</p>
        <p className="card-text mb-1"><strong>Mobile:</strong> {mobile}</p>
        <p className="card-text mb-1"><strong>Email:</strong> {email}</p>

        <button onClick={() => router.push(`/${id}`)} className="btn btn-outline-primary-custom me-2">Edit</button>
        <button onClick={() => onDelete(id)} className="btn btn-outline-danger">Delete</button>
      </div>
    </div>
  );
}
