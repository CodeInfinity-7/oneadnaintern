'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
export default function NewBusinessPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    owner: '',
    email: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: '' })); // Clear error for this field
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(selected.type)) {
      toast.error('Only PDF, JPG, or PNG files are allowed');


      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setKycFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
    setErrors({});

    // Client-side validation
    const newErrors: Partial<typeof form> = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) newErrors[key as keyof typeof form] = 'This field is required';
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = 'Enter a valid email';
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (form.phone && !phoneRegex.test(form.phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Step 1: Create Business
     const token = localStorage.getItem('token');

const res = await fetch('/api/businesses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(form),
});

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');

        // Field-specific backend error (e.g., duplicate name)
        if (data.error?.toLowerCase().includes('name')) {
          setErrors({ name: data.error });
        } else {
          toast.error(data?.error || 'Failed to create business.');

        }
        return;
      }

      // Step 2: Upload KYC file if selected
      if (kycFile) {
        const kycForm = new FormData();
        kycForm.append('kyc', kycFile);

        const xhr = new XMLHttpRequest();
       

xhr.open('POST', `/api/businesses/${data.id}/kyc`, true);

xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 201) {
    handleSuccess();
} else {
            setStatus('error');
            setErrorMsg('KYC upload failed.');
          }
        };

        xhr.onerror = () => {
          setStatus('error');
          setErrorMsg('KYC upload failed due to network error.');
        };

        xhr.send(kycForm);
      } else {
        handleSuccess();
      }
    } catch (err) {
  setStatus('error');
 toast.error('Something went wrong while submitting.');

}

  };

  const handleSuccess = () => {
    setStatus('success');
    setForm({ name: '', owner: '', email: '', phone: '', address: '' });
    setKycFile(null);
    setProgress(0);
    setTimeout(() => router.push('/'), 1500);
    toast.success('Business created successfully!');

  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f8f8ff' }}>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 p-md-5 border rounded-4 shadow-lg"
        style={{ borderColor: '#6224E1', width: '100%', maxWidth: '600px' }}
        noValidate
      >
        <h2 className="mb-4 text-center fw-bold text-primary-custom">Add New Business</h2>

        {['name', 'owner', 'email', 'phone', 'address'].map((field) => (
          <div className="mb-3" key={field}>
            <label htmlFor={field} className="form-label fw-semibold text-primary-custom text-capitalize">
              {field}
            </label>
            <input
              type="text"
              className={`form-control ${errors[field as keyof typeof form] ? 'is-invalid' : ''}`}
              id={field}
              name={field}
              value={form[field as keyof typeof form]}
              onChange={handleChange}
              aria-invalid={!!errors[field as keyof typeof form]}
              aria-describedby={`${field}-error`}
            />
            {errors[field as keyof typeof form] && (
              <div id={`${field}-error`} className="invalid-feedback">
                {errors[field as keyof typeof form]}
              </div>
            )}
          </div>
        ))}

        <div className="mb-3">
          <label htmlFor="kyc" className="form-label fw-semibold text-primary-custom">
            Upload KYC Document
          </label>
          <input
            type="file"
            id="kyc"
            name="kyc"
            className="form-control"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
        </div>

        {kycFile && (
          <>
            <div className="mb-2 text-muted">
              Selected file: <strong>{kycFile.name}</strong>
            </div>
            <div className="progress mb-3">
              <div className="progress-bar" role="progressbar" style={{ width: `${progress}%` }}>
                {progress}%
              </div>
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary-custom w-100 mt-3" disabled={progress > 0 && progress < 100}>
          Submit
        </button>

      
      </form>
    </div>
  );
}
