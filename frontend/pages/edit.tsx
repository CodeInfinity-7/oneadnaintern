'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';


export default function EditEmployeePage() {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    full_name: '',
    designation: '',
    mobile: '',
    email: '',
    business_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`http://localhost:4000/employees/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then((data) => {
          setFormData({
            full_name: data.full_name || '',
            designation: data.designation || '',
            mobile: data.mobile || '',
            email: data.email || '',
            business_id: data.business_id?.toString() || '',
          });
          setFetchError('');
        })
        .catch(() => setFetchError('Failed to load employee details'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:4000/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          business_id: parseInt(formData.business_id, 10)
        }),
      });

      if (res.ok) {
        toast.success('Employee updated successfully!');
        setTimeout(() => router.push('/employees'), 1500);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update employee');
      }
    } catch (err) {
      toast.error('Server error');
    }
  };

  if (loading) return <p>Loading employee data...</p>;
  if (fetchError) return <p className="text-danger">{fetchError}</p>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Edit Employee</h2>
      <form onSubmit={handleSubmit} className="row g-3">
        {['full_name', 'designation', 'mobile', 'email', 'business_id'].map((field) => (
          <div className="col-md-6" key={field}>
            <label className="form-label text-capitalize">{field.replace('_', ' ')}</label>
            <input
              type={field === 'email' ? 'email' : 'text'}
              className="form-control"
              name={field}
              value={formData[field as keyof typeof formData]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Update Employee</button>
        </div>
      </form>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
