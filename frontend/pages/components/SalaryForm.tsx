'use client';

import React from 'react';

interface Employee {
  id: number;
  full_name: string;
}

interface FormData {
  employee_id: string;
  base_salary: string;
  bonus: string;
  deductions: string;
}

interface SalaryFormProps {
  employees: Employee[];
  formData: FormData;
  errors: Record<string, string>;
  isCalculating: boolean;
  isSaving: boolean;
  total: number | null;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  calculateSalary: () => void;
  saveSalary: () => void;
}

export default function SalaryForm({
  employees,
  formData,
  errors,
  isCalculating,
  isSaving,
  total,
  handleChange,
  calculateSalary,
  saveSalary,
}: SalaryFormProps) {
  return (
    <>
      <form className="row g-3" onSubmit={(e) => e.preventDefault()}>
        <div className="col-md-6">
          <label className="form-label">Employee</label>
          <select
            name="employee_id"
            className={`form-select ${
              errors.employee_id ? 'is-invalid' : ''
            }`}
            value={formData.employee_id}
            onChange={handleChange}
          >
            <option value="">Select</option>

            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>

          <div className="invalid-feedback">
            {errors.employee_id}
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label">Base Salary</label>

          <input
            type="number"
            name="base_salary"
            className={`form-control ${
              errors.base_salary ? 'is-invalid' : ''
            }`}
            value={formData.base_salary}
            onChange={handleChange}
            min="0"
          />

          <div className="invalid-feedback">
            {errors.base_salary}
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label">Bonus</label>

          <input
            type="number"
            name="bonus"
            className={`form-control ${
              errors.bonus ? 'is-invalid' : ''
            }`}
            value={formData.bonus}
            onChange={handleChange}
            min="0"
          />

          <div className="invalid-feedback">
            {errors.bonus}
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label">Deductions</label>

          <input
            type="number"
            name="deductions"
            className={`form-control ${
              errors.deductions ? 'is-invalid' : ''
            }`}
            value={formData.deductions}
            onChange={handleChange}
            min="0"
          />

          <div className="invalid-feedback">
            {errors.deductions}
          </div>
        </div>

        <div className="col-md-6 d-grid">
          <button
            type="button"
            className="btn btn-primary"
            onClick={calculateSalary}
            disabled={isCalculating}
          >
            {isCalculating
              ? 'Calculating...'
              : 'Calculate Salary'}
          </button>
        </div>

        <div className="col-md-6 d-grid">
          <button
            type="button"
            className="btn btn-success"
            onClick={saveSalary}
            disabled={isSaving}
          >
            {isSaving
              ? 'Saving...'
              : 'Save Salary Entry'}
          </button>
        </div>
      </form>

      {total !== null && (
        <div className="alert alert-info mt-4 text-center">
          <strong>Total Salary: ₹{total.toFixed(2)}</strong>
        </div>
      )}
    </>
  );
}
