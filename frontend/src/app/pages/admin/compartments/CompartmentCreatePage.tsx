import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAdminStore } from "../../stores/admin.store";
import { showError, showSuccess } from "../../utils/swal";
import { mapErrorToMessage } from "../../utils/errorMapper";

type CompartmentRow = {
  compartment_no: string;
  size: string;
};

const CompartmentCreatePage = () => {
  const { lockerId: lockerParamId } = useParams();
  const { lockers, loadLockers, createCompartments, lastLockerId } = useAdminStore((state) => ({
    lockers: state.lockers,
    loadLockers: state.loadLockers,
    createCompartments: state.createCompartments,
    lastLockerId: state.lastLockerId
  }));

  const [lockerId, setLockerId] = useState(lockerParamId ?? "");
  const [rows, setRows] = useState<CompartmentRow[]>([{ compartment_no: "", size: "M" }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await loadLockers();
        if (!lockerId && (lockerParamId || lastLockerId)) {
          setLockerId(lockerParamId || lastLockerId || "");
        }
      } catch (error) {
        await showError("Error", mapErrorToMessage(error));
      }
    };
    load();
  }, [lastLockerId, loadLockers, lockerId, lockerParamId]);

  const handleRowChange = (index: number, field: keyof CompartmentRow, value: string) => {
    setRows((prev) => prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { compartment_no: "", size: "M" }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!lockerId || rows.some((r) => !r.compartment_no)) return;
    try {
      setLoading(true);
      const compartments = rows.map((row) => ({ compartment_no: row.compartment_no, size: row.size }));
      const res = await createCompartments(lockerId, { compartments });
      const createdCount = (res as any)?.created ?? compartments.length;
      await showSuccess("Compartments created", `Created: ${createdCount}`);
    } catch (error) {
      await showError("Error", mapErrorToMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3 fw-semibold" style={{ color: "var(--color-text-main)" }}>
        Create Compartments
      </h3>
      <div className="card p-4 p-md-5">
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Locker</label>
            <select
              className="form-select"
              value={lockerId}
              onChange={(e) => setLockerId(e.target.value)}
              disabled={loading}
            >
              <option value="">Select locker</option>
              {lockers.map((locker) => (
                <option key={locker.locker_id} value={locker.locker_id}>
                  {locker.locker_code ?? locker.locker_id}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="fw-semibold">Compartments</div>
              <button className="btn btn-outline-secondary btn-sm" type="button" onClick={addRow} disabled={loading}>
                Add Row
              </button>
            </div>
            <div className="d-flex flex-column gap-2">
              {rows.map((row, idx) => (
                <div className="row g-2 align-items-center" key={idx}>
                  <div className="col-6 col-md-4">
                    <input
                      className="form-control"
                      placeholder="Compartment No"
                      value={row.compartment_no}
                      onChange={(e) => handleRowChange(idx, "compartment_no", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="col-4 col-md-3">
                    <select
                      className="form-select"
                      value={row.size}
                      onChange={(e) => handleRowChange(idx, "size", e.target.value)}
                      disabled={loading}
                    >
                      <option value="S">Small</option>
                      <option value="M">Medium</option>
                      <option value="L">Large</option>
                    </select>
                  </div>
                  <div className="col-2 col-md-2 d-flex justify-content-end">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      type="button"
                      onClick={() => removeRow(idx)}
                      disabled={loading || rows.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12 d-flex justify-content-end">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Create Compartments"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompartmentCreatePage;
export { CompartmentCreatePage };
