'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Payslip {
  id?: number;
  pdf_url: string;
  qr_code: string;
  salary_date: string;
}

const PayslipHistory = () => {
  const router = useRouter();
  const { employee_id } = router.query;

  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employee_id) return;
    const token = localStorage.getItem('token');

    fetch(`/api/payslips/history/${employee_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPayslips(data);
        } else {
          toast.error('Invalid data received');
        }
      })
      .catch(() => toast.error('Failed to load payslips'))
      .finally(() => setLoading(false));
  }, [employee_id]);

  return (
    <div className="container py-5">
      <ToastContainer />
      <h3>Payslip History for Employee ID: {employee_id}</h3>

      {loading ? (
        <p>Loading...</p>
      ) : payslips.length === 0 ? (
        <p>No payslips found.</p>
      ) : (
        <table className="table table-striped mt-4">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>PDF</th>
              <th>QR Code</th>
            </tr>
          </thead>
          <tbody>
            {payslips.map((slip, index) => (
  <tr key={slip.id || index}>
    <td>{index + 1}</td>
    <td>{new Date(slip.salary_date).toLocaleDateString()}</td>
    <td>
      <a
  href={`/api/pdfs/${slip.pdf_url}`}
  target="_blank"
  rel="noopener noreferrer"
  className="btn btn-sm btn-primary"
>
  View PDF
</a>

    </td>
    <td>
      <code>{slip.qr_code}</code>
    </td>
  </tr>
))}

          </tbody>
        </table>
      )}
    </div>
  );
};

export default PayslipHistory;
