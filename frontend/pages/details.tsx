'use client';

import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ReportRow {
  employee_id: number;
  full_name: string;
  base_salary: number;
  bonus: number;
  deductions: number;
  net_paid: number;
}

interface Summary {
  total_base_salary: number;
  total_bonus: number;
  total_deductions: number;
  total_net_paid: number;
}

export default function DetailedReportPage() {
  const [businessId, setBusinessId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const limit = 2;

  const fetchReport = async () => {
    if (!businessId || !startDate || !endDate) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const query = new URLSearchParams({
        business_id: businessId,
        start_date: startDate,
        end_date: endDate,
        page: String(page),
        limit: String(limit),
      });

      const token = localStorage.getItem('token');

const res = await fetch(`/api/reports/details?${query}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      setReportData(data.details);
      setSummary(data.summary);
      setTotalPages(Math.max(1, Math.ceil(data.pagination.total / limit)));

      if (!hasFetchedOnce) {
        toast.success('Report fetched successfully!');
        setHasFetchedOnce(true);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (hasFetchedOnce) {
    fetchReport();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [page, hasFetchedOnce]);

 const handleExport = async (type: 'pdf' | 'excel') => {
  try {
    const token = localStorage.getItem('token');

    const query = new URLSearchParams({
      business_id: businessId,
      start_date: startDate,
      end_date: endDate,
      type,
    });

    const res = await fetch(`/api/reports/export?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error(`Export failed: ${res.status}`);

    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition');
    let filename = `payroll_report.${type === 'pdf' ? 'pdf' : 'xlsx'}`;

    if (disposition) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match?.[1]) {
        filename = match[1];
      }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success(`Downloaded ${type.toUpperCase()} report successfully`);
  } catch (err) {
    console.error('[EXPORT ERROR]', err);
    toast.error(`Failed to download ${type.toUpperCase()} report`);
  }
};

  return (
    
    <div className="container py-5">
      <ToastContainer />
      <h2 className="mb-4 text-primary">Detailed Salary Report</h2>

      {/* Filters */}
      <div className="row g-3 align-items-end mb-4">
        <div className="col-md-3">
          <label className="form-label">Business ID</label>
          <input
            type="text"
            className="form-control"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="col-md-3 d-grid">
          <button
            onClick={() => {
              setPage(1);
              setHasFetchedOnce(false);
              fetchReport();
            }}
            className="btn btn-primary"
          >
            {loading ? 'Loading...' : 'Fetch Report'}
          </button>
        </div>
      </div>

      {/* Report Table */}
      {reportData.length > 0 && (
        <>
          <div className="d-flex gap-2 mb-3">
            <button className="btn btn-success" onClick={() => handleExport('pdf')}>
              Download PDF
            </button>
            <button className="btn btn-info text-white" onClick={() => handleExport('excel')}>
              Download Excel
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Base Salary</th>
                  <th>Bonus</th>
                  <th>Deductions</th>
                  <th>Net Paid</th>
                </tr>
              </thead>
              <tbody>
  {reportData.map((row) => (
    <tr key={row.employee_id}>
      <td>{row.employee_id}</td>
      <td>{row.full_name}</td>
      <td>₹{(Number(row.base_salary) || 0).toFixed(2)}</td>
      <td>₹{(Number(row.bonus) || 0).toFixed(2)}</td>
      <td>₹{(Number(row.deductions) || 0).toFixed(2)}</td>
      <td>₹{(Number(row.net_paid) || 0).toFixed(2)}</td>
    </tr>
  ))}
</tbody>

            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-center align-items-center gap-3 my-4">
  <button
    className="btn"
    style={{
      backgroundColor: page === 1 ? '#ccc' : '#6224E1',
      color: 'white',
      border: 'none',
    }}
    disabled={page === 1}
    onClick={() => setPage((p) => Math.max(1, p - 1))}
  >
    Previous
  </button>
  <span>
    <strong>Page {page} of {totalPages}</strong>
  </span>
  <button
    className="btn"
    style={{
      backgroundColor: page === totalPages ? '#ccc' : '#6224E1',
      color: 'white',
      border: 'none',
    }}
    disabled={page === totalPages}
    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
  >
    Next
  </button>
</div>


          {/* Summary */}
          {summary && (
            <div className="card bg-light p-4">
              <h5 className="text-primary mb-3">Summary</h5>
              <ul className="list-unstyled">
                <li><strong>Total Base Salary:</strong> ₹{summary.total_base_salary}</li>
                <li><strong>Total Bonus:</strong> ₹{summary.total_bonus}</li>
                <li><strong>Total Deductions:</strong> ₹{summary.total_deductions}</li>
                <li><strong>Total Net Paid:</strong> ₹{summary.total_net_paid}</li>
              </ul>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && reportData.length === 0 && hasFetchedOnce && (
        <p className="text-muted mt-4">No records found for the selected filters.</p>
      )}
    </div>
  );
}
