'use client';

export default function PayrollSummary({
  businessId,
  month,
  setBusinessId,
  setMonth,
  loadingSummary,
  summary,
  fetchSummary,
}: {
  businessId: string;
  month: string;
  setBusinessId: (val: string) => void;
  setMonth: (val: string) => void;
  loadingSummary: boolean;
  summary: number | null;
  fetchSummary: () => void;
}) {
  return (
    <div className="mt-5">
      <h4>Payroll Summary by Business and Month</h4>
      <div className="row g-2 align-items-end">
        <div className="col-md-4">
          <label className="form-label">Business ID</label>
          <input
            type="number"
            placeholder="Enter Business ID"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            className="form-control"
            min="1"
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="col-md-4 d-grid">
          <button
            className="btn btn-secondary"
            onClick={fetchSummary}
            disabled={loadingSummary}
          >
            {loadingSummary ? 'Loading...' : 'Fetch Summary'}
          </button>
        </div>
      </div>

      {typeof summary === 'number' && (
        <div className="alert alert-success mt-3">
          <strong>Total Payroll for {month}:</strong> ₹{summary.toFixed(2)}
        </div>
      )}
    </div>
  );
}
