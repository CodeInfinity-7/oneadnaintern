'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface Employee {
  id: number;
  full_name: string;
}

interface SalaryEntry {
  employee_id: number;
}
const SalaryForm = dynamic(() => import('../components/SalaryForm'));
const PayrollSummary = dynamic(() => import('../components/PayrollSummary'));
const PayslipTable = dynamic(() => import('../components/PayslipTable'));

export default function SalariesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryEntries, setSalaryEntries] = useState<number[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    employee_id: '',
    base_salary: '',
    bonus: '',
    deductions: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [total, setTotal] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState<number | null>(null);
  const [businessId, setBusinessId] = useState('');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [summary, setSummary] = useState<number | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Unauthorized. Please log in.');
      setLoadingEmployees(false);
      return;
    }

    fetch('/api/employees', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.employees)) {
          setEmployees(data.employees);
        } else {
          toast.error('Employees data is invalid');
        }
      })
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoadingEmployees(false));

    fetch('/api/salaries/all', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const ids = data.map((s: SalaryEntry) => s.employee_id);
          setSalaryEntries(ids);
        } else {
          toast.error('Invalid salary data');
        }
      })
      .catch(() => toast.error('Failed to load salary records'));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setTotal(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const { employee_id, base_salary, bonus, deductions } = formData;

    if (!employee_id) newErrors.employee_id = 'Required';
    if (!base_salary) newErrors.base_salary = 'Required';
    else if (isNaN(Number(base_salary)) || Number(base_salary) < 0)
      newErrors.base_salary = 'Must be a non-negative number';

    if (!bonus) newErrors.bonus = 'Required';
    else if (isNaN(Number(bonus)) || Number(bonus) < 0)
      newErrors.bonus = 'Must be a non-negative number';

    if (!deductions) newErrors.deductions = 'Required';
    else if (isNaN(Number(deductions)) || Number(deductions) < 0)
      newErrors.deductions = 'Must be a non-negative number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateSalary = async () => {
    if (!validate()) return;

    const token = localStorage.getItem('token');
    setIsCalculating(true);

    try {
      const res = await fetch('/api/salaries/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          base_salary: parseFloat(formData.base_salary),
          bonus: parseFloat(formData.bonus),
          deductions: parseFloat(formData.deductions),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTotal(data.total_amount);
        toast.success('Salary calculated');
      } else {
        toast.error(data.error || 'Calculation failed');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setIsCalculating(false);
    }
  };

  const saveSalary = async () => {
    if (!validate()) return;

    const token = localStorage.getItem('token');
    setIsSaving(true);

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
          bonus: parseFloat(formData.bonus),
          deductions: parseFloat(formData.deductions),
          total_amount:
            total ??
            parseFloat(formData.base_salary) +
              parseFloat(formData.bonus) -
              parseFloat(formData.deductions),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Salary saved');
      } else if (
        data.error === 'Salary entry already exists for this employee'
      ) {
        toast.warn('Salary has already been allocated for this employee');
      } else {
        toast.error(data.error || 'Save failed');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async (employeeId: number) => {
    const token = localStorage.getItem('token');
    setGeneratingPDF(employeeId);

    try {
      const res = await fetch('/api/payslips/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employee_id: employeeId }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to generate payslip');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip_${employeeId}.pdf`;
      link.click();
      toast.success('Payslip downloaded');
    } catch {
      toast.error('Error generating payslip');
    } finally {
      setGeneratingPDF(null);
    }
  };

  const fetchSummary = async () => {
    if (!businessId || isNaN(Number(businessId))) {
      toast.error('Please enter a valid business ID');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Unauthorized');
      return;
    }

    setLoadingSummary(true);
    setSummary(null);

    try {
      const res = await fetch(
        `/api/salaries/summary?business_id=${businessId}&month=${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        setSummary(data.total_payroll);
      } else {
        toast.error(data.error || 'Failed to fetch summary');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setLoadingSummary(false);
    }
  };
if (loadingEmployees) {
  return <div>Loading...</div>;
}
  return (
    <div className="container py-5">
      
      <h3 className="mb-4">Strict Salary Entry Form</h3>
      <SalaryForm
        employees={employees}
        formData={formData}
        errors={errors}
        isCalculating={isCalculating}
        isSaving={isSaving}
        total={total}
        handleChange={handleChange}
        calculateSalary={calculateSalary}
        saveSalary={saveSalary}
      />

      <hr className="my-5" />

      <PayrollSummary
        businessId={businessId}
        month={month}
        setBusinessId={setBusinessId}
        setMonth={setMonth}
        loadingSummary={loadingSummary}
        summary={summary}
        fetchSummary={fetchSummary}
      />

      <hr className="my-5" />

      <div className="table-responsive">
        <PayslipTable
          employees={employees}
          salaryEntries={salaryEntries}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          generatingPDF={generatingPDF}
          handleGeneratePDF={handleGeneratePDF}
        />
      </div>
    </div>
  );
}
