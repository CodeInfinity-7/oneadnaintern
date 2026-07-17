'use client';

interface Employee {
  id: number;
  full_name: string;
  designation?: string;
  email?: string;
}

interface PayslipTableProps {
  employees?: Employee[];
  salaryEntries?: number[];
  searchTerm?: string;
  setSearchTerm: (value: string) => void;
  generatingPDF: number | null;
  handleGeneratePDF: (id: number) => void;
}

export default function PayslipTable({
  employees = [],
  salaryEntries = [],
  searchTerm = '',
  setSearchTerm,
  generatingPDF,
  handleGeneratePDF,
}: PayslipTableProps) {
  const filtered = (employees ?? []).filter((emp) =>
    `${emp.full_name} ${emp.designation ?? ''} ${emp.email ?? ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-5">
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, designation, or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <h4>Generate Payslip for Employees</h4>

      {filtered.length === 0 ? (
        <p className="text-muted">No employees found.</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((emp, index) => (
              <tr key={emp.id}>
                <td>{index + 1}</td>
                <td>{emp.full_name}</td>
                <td>{emp.designation || '—'}</td>
                <td>{emp.email || '—'}</td>

                <td className="d-flex flex-column gap-2">
                  {(salaryEntries ?? []).includes(emp.id) ? (
                    <>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleGeneratePDF(emp.id)}
                        disabled={generatingPDF === emp.id}
                      >
                        {generatingPDF === emp.id
                          ? 'Generating...'
                          : 'Generate PDF'}
                      </button>

                      <a
                        href={`/paysliphistory?employee_id=${emp.id}`}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        View History
                      </a>

                      <a
                        href={`/api/payslips/latest?employee_id=${emp.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-success"
                      >
                        View Latest PDF
                      </a>
                    </>
                  ) : (
                    <span className="text-danger">
                      You have to add salary
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
