'use client';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function EditEmployeePage() {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    full_name: '',
    designation: '',
    mobile: '',
    email: '',
    business_id: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || typeof id !== 'string') return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Unauthorized! Please login.');
      router.push('/login');
      return; // stop further execution
    }

     fetch(`/api/employees/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading employee:', err.message);
        alert('Failed to load employee details');
        setLoading(false);
      });
  }, [router.isReady, id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const res = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData,
        business_id: parseInt(formData.business_id, 10),
      }),
    });

    if (res.ok) {
       toast.success('Employee updated successfully!');
      setTimeout(() => {
      router.push('/employees');
    }, 1500); // show toast for 1.5s before redirect
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to update employee');
    }
  };

  if (loading) {
    return <div className="container py-5">Loading employee details...</div>;
  }

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
    </div>
  );
}
