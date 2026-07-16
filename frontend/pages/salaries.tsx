'use client';

import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Employee {
  id: number;
  full_name: string;
}

export default function SalaryCalculationPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    base_salary: '',
    bonus: '',
    deductions: '',
  });

  const [total, setTotal] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Unauthorized. Please log in.');
      return;
    }

    fetch('/api/employees', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch employees');
        return res.json();
      })
      .then((data) => {
        setEmployees(data.employees || []);
      })
      .catch(() => {
        setFetchError('Failed to load employees');
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateSalary = async () => {
    setTotal(null);

    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Unauthorized. Please log in.');
      return;
    }

    try {
      const res = await fetch('/api/salaries/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          base_salary: parseFloat(formData.base_salary),
          bonus: parseFloat(formData.bonus) || 0,
          deductions: parseFloat(formData.deductions) || 0,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setTotal(data.total_amount);
        toast.success('Salary calculated!');
      } else {
        toast.error(data.error || 'Calculation failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error');
    }
  };

  const saveSalary = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Unauthorized. Please log in.');
      return;
    }

    try {
      const res = await fetch('/api/salaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: parseInt(formData.employee_id),
          base_salary: parseFloat(formData.base_salary),
          bonus: parseFloat(formData.bonus) || 0,
          deductions: parseFloat(formData.deductions) || 0,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Salary saved successfully!');
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error');
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Salary Entry</h2>

      {fetchError && (
        <p className="text-danger">{fetchError}</p>
      )}

      <form
        onSubmit={(e) => e.preventDefault()}
        className="row g-3"
      >
        <div className="col-md-6">
          <label className="form-label">Employee</label>

          <select
            name="employee_id"
            className="form-select"
            value={formData.employee_id}
            onChange={handleChange}
            required
          >
            <option value="">Select an employee</option>

            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Base Salary</label>

          <input
            type="number"
            name="base_salary"
            className="form-control"
            value={formData.base_salary}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Bonus</label>

          <input
            type="number"
            name="bonus"
            className="form-control"
            value={formData.bonus}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Deductions</label>

          <input
            type="number"
            name="deductions"
            className="form-control"
            value={formData.deductions}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 d-grid gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={calculateSalary}
          >
            Calculate Salary
          </button>
        </div>

        <div className="col-md-6 d-grid gap-2">
          <button
            type="button"
            className="btn btn-success"
            onClick={saveSalary}
          >
            Save Salary Entry
          </button>
        </div>
      </form>

      {total !== null && (
        <div className="alert alert-success mt-4 text-center">
          <strong>Total Salary: ₹{total.toFixed(2)}</strong>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
