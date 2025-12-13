import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminStore } from "../../../stores/admin.store";
import { showError, showSuccess } from "../../../utils/swal";
import { mapErrorToMessage } from "../../../utils/errorMapper";
import { CompartmentBatchCreateRequest } from "../../../types/api";

type CompartmentRow = {
  compartment_no: number | "";
  size: "S" | "M" | "L";
};

const CompartmentBatchCreatePage = () => {
  const navigate = useNavigate();
  const { lockerId } = useParams();
  const { createCompartments } = useAdminStore((state) => ({
    createCompartments: state.createCompartments
  }));
  const [rows, setRows] = useState<CompartmentRow[]>([{ compartment_no: "", size: "M" }]);
  const [loading, setLoading] = useState(false);

  const addRow = () => {
    setRows((prev) => [...prev, { compartment_no: "", size: "M" }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateRow = (index: number, field: keyof CompartmentRow, value: string | number | "") => {
    setRows((prev) => prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row)));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!lockerId) return;
    if (rows.length === 0 || rows.some((r) => r.compartment_no === "")) return;

    const payload: CompartmentBatchCreateRequest = {
      compartments: rows.map((row) => ({
        compartment_no: Number(row.compartment_no),
        size: row.size
      }))
    };

    try {
      setLoading(true);
      await createCompartments(lockerId, payload);
      await showSuccess("Compartments created", "");
      navigate(`/admin/lockers/${lockerId}/compartments`);
    } catch (error) {
      await showError("Error", mapErrorToMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (lockerId) {
      navigate(`/admin/lockers/${lockerId}/compartments`);
    } else {
      navigate("/admin/lockers");
    }
  };

  return (
    <div className="container py-4">
      <div className="card p-4 p-md-5">
        <h3 className="mb-4 fw-semibold" style={{ color: "var(--color-text-main)" }}>
          Create Compartments
        </h3>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div className="fw-semibold">Rows</div>
            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={addRow} disabled={loading}>
              Add Row
            </button>
          </div>
          <div className="col-12 d-flex flex-column gap-2">
            {rows.map((row, idx) => (
              <div className="row g-2 align-items-center" key={idx}>
                <div className="col-6 col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Compartment No"
                    value={row.compartment_no}
                    onChange={(e) => updateRow(idx, "compartment_no", e.target.value === "" ? "" : Number(e.target.value))}
                    disabled={loading}
                  />
                </div>
                <div className="col-4 col-md-3">
                  <select
                    className="form-select"
                    value={row.size}
                    onChange={(e) => updateRow(idx, "size", e.target.value as CompartmentRow["size"])}
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
          <div className="col-12 d-flex justify-content-end gap-2">
            <button className="btn btn-outline-secondary" type="button" onClick={handleCancel} disabled={loading}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompartmentBatchCreatePage;
export { CompartmentBatchCreatePage };
