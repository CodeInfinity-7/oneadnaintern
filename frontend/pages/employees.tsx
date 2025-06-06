'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Papa from 'papaparse';

interface Employee {
  id?: number;
  full_name: string;
  designation: string;
  mobile: string;
  email: string;
  business_id: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const businessId = router.query.business_id as string;

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<Employee[]>([]);
  const [csvErrors, setCsvErrors] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search.trim()) {
        queryParams.append('search', search.trim());
      }

      const endpoint = businessId
        ? `http://localhost:4000/employees/business/${businessId}`
        : `http://localhost:4000/employees?${queryParams.toString()}`;

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (businessId && data.data) {
        setEmployees(data.data);
        setTotal(data.total || 0);
      } else if (Array.isArray(data.employees)) {
        setEmployees(data.employees);
        setTotal(data.total || 0);
      } else if (Array.isArray(data)) {
        setEmployees(data);
        setTotal(data.length || 0);
      } else {
        console.error('Unexpected data format:', data);
        setEmployees([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, businessId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      fetchEmployees();
    }
  }, [fetchEmployees, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this employee?');
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`http://localhost:4000/employees/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Employee deleted successfully!');
        fetchEmployees();
      } else {
        toast.error(data.error || 'Failed to delete employee');
      }
    } catch (err) {
      toast.error('Server error while deleting employee');
    }
  };

  const handleCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCsvFile(file || null);
    setCsvErrors([]);
    setCsvPreview([]);

    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const parsed = result.data as any[];
          const errors: any[] = [];

          const validRows = parsed.filter((row, index) => {
            let reason = '';
            if (!row.full_name) reason = 'Missing full_name';
            else if (!row.email?.includes('@')) reason = 'Invalid email';
            else if (!row.designation) reason = 'Missing designation';
            else if (!row.business_id || isNaN(Number(row.business_id))) reason = 'Invalid business_id';

            if (reason) {
              errors.push({ index, row, reason });
              return false;
            }
            return true;
          });

          setCsvPreview(validRows);
          setCsvErrors(errors);
        },
      });
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile) return toast.error('Please select a CSV file');

    const formData = new FormData();
    formData.append('file', csvFile);

    if (businessId) {
      formData.append('business_id', businessId);
    }

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:4000/employees/bulk-upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Uploaded ${data.inserted} employees`);
        setCsvFile(null);
        setCsvPreview([]);
        setCsvErrors([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchEmployees();
      } else {
        toast.error('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      toast.error('Server error during upload');
    }
  };

  const downloadTemplate = () => {
    const sample = [
      ['full_name', 'email', 'designation', 'mobile', 'business_id'],
      ['John Doe', 'john@example.com', 'Engineer', '1234567890', '1'],
    ];

    const csv = sample.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_template.csv';
    link.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: '#f8f8ff' }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary-custom border-bottom border-3 pb-2 border-primary-custom">
            Employees
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => router.push('/add')}
              className="btn btn-primary-custom rounded-pill px-4 py-2"
            >
              + Add Employee
            </button>
            <button
              onClick={() => router.push('/salaries')}
              className="btn btn-primary-custom rounded-pill px-4 py-2"
            >
              edit salaries
            </button>
            <button className="btn btn-primary-custom rounded-pill px-4 py-2" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="csvUpload" className="form-label fw-semibold">Upload CSV</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="form-control mb-2"
            onChange={handleCSVChange}
          />
          <button className="btn btn-outline-info btn-sm mb-3" onClick={downloadTemplate}>
            Download CSV Template
          </button>

          {csvPreview.length > 0 && (
            <>
              <h5 className="mt-3">Preview:</h5>
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Designation</th>
                    <th>Mobile</th>
                    <th>Business ID</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.map((emp, idx) => (
                    <tr key={idx}>
                      <td>{emp.full_name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.designation}</td>
                      <td>{emp.mobile}</td>
                      <td>{emp.business_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn btn-success mt-2" onClick={handleCSVUpload}>
                Upload Employees
              </button>
            </>
          )}

          {csvErrors.length > 0 && (
            <div className="mt-3 text-danger">
              <h6>Invalid Rows:</h6>
              <ul>
                {csvErrors.map((err, idx) => (
                  <li key={idx}>Row {err.index + 2}: {err.reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search employees by name..."
            className="form-control"
          />
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {employees.length === 0 && (
              <p className="text-center text-muted">No employees found.</p>
            )}

            {employees.map((emp) => (
              <div className="col-md-6" key={emp.id}>
                <div className="card h-100 border border-primary-custom shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title text-primary-custom fw-semibold">{emp.full_name}</h5>
                    <p className="card-text mb-1"><strong>Business ID:</strong> {emp.business_id}</p>
                    <p className="card-text mb-1"><strong>Designation:</strong> {emp.designation}</p>
                    <p className="card-text mb-1"><strong>Mobile:</strong> {emp.mobile}</p>
                    <p className="card-text mb-1"><strong>Email:</strong> {emp.email}</p>
                    <button onClick={() => router.push(`/${emp.id}`)} className="btn btn-outline-primary-custom me-2">Edit</button>
                    <button onClick={() => handleDelete(emp.id!)} className="btn btn-outline-danger">Delete</button>
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
            Page {page} of {totalPages || 1}
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
