'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
export default function AddEmployee() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [formError, setFormError] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errors: { [key: string]: string } = {};

    if (!fullName.trim()) errors.full_name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email';

    if (!mobile.trim()) errors.mobile = 'Mobile is required';
    else if (!/^\d{10}$/.test(mobile)) errors.mobile = 'Invalid mobile number';

    if (!designation.trim()) errors.designation = 'Designation is required';
    if (!businessId.trim()) errors.business_id = 'Business ID is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormError('');

  const token = localStorage.getItem('token');

  if (!validate()) return;

  // Check if business_id exists
  try {
    const businessRes = await fetch(`/api/businesses/${businessId}`);

    if (!businessRes.ok) {
      toast.error('Business ID does not exist');
      return;
    }
  } catch {
    toast.error('Error checking business ID');
    return;
  }

  // Proceed to submit employee
  try {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        business_id: parseInt(businessId, 10),
        full_name: fullName,
        designation,
        mobile,
        email,
      }),
    });

    if (res.ok) {
      toast.success('Employee added successfully!');
      setTimeout(() => router.push('/employees'), 1500);
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to add employee');
    }
  } catch {
    toast.error('Server error');
  }
};

  return (
    <div className="container py-5">
      <h1 className="mb-4 text-primary-custom">Add New Employee</h1>
      <form onSubmit={handleSubmit} className="border rounded p-4 shadow-sm bg-light">

        {/* Business ID */}
        <div className="mb-3">
          <label htmlFor="business_id" className="form-label">Business ID</label>
          <input
            type="number"
            className={`form-control ${formErrors.business_id ? 'is-invalid' : ''}`}
            id="business_id"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
          />
          {formErrors.business_id && (
            <div className="invalid-feedback">{formErrors.business_id}</div>
          )}
        </div>

        {/* Full Name */}
        <div className="mb-3">
          <label htmlFor="full_name" className="form-label">Full Name</label>
          <input
            type="text"
            className={`form-control ${formErrors.full_name ? 'is-invalid' : ''}`}
            id="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          {formErrors.full_name && (
            <div className="invalid-feedback">{formErrors.full_name}</div>
          )}
        </div>

        {/* Designation */}
        <div className="mb-3">
          <label htmlFor="designation" className="form-label">Designation</label>
          <input
            type="text"
            className={`form-control ${formErrors.designation ? 'is-invalid' : ''}`}
            id="designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />
          {formErrors.designation && (
            <div className="invalid-feedback">{formErrors.designation}</div>
          )}
        </div>

        {/* Mobile */}
        <div className="mb-3">
          <label htmlFor="mobile" className="form-label">Mobile</label>
          <input
            type="text"
            className={`form-control ${formErrors.mobile ? 'is-invalid' : ''}`}
            id="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          {formErrors.mobile && (
            <div className="invalid-feedback">{formErrors.mobile}</div>
          )}
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {formErrors.email && (
            <div className="invalid-feedback">{formErrors.email}</div>
          )}
        </div>

        {/* Error Message */}
        {formError && <div className="alert alert-danger">{formError}</div>}

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary-custom mt-3">Add Employee</button>
      </form>
    </div>
  );
}
