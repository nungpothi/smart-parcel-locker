import { FormEvent, useState } from "react";
import { useAdminStore } from "../../../stores/admin.store";
import { showError, showSuccess } from "../../../utils/swal";
import { mapErrorToMessage } from "../../../utils/errorMapper";

const LocationCreatePage = () => {
  const { createLocation } = useAdminStore((state) => ({ createLocation: state.createLocation }));
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    try {
      setLoading(true);
      await createLocation({ code, name, address, is_active: isActive } as any);
      await showSuccess("Location created", "Location has been added.");
      setCode("");
      setName("");
      setAddress("");
      setIsActive(true);
    } catch (error) {
      await showError("Error", mapErrorToMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 d-flex justify-content-center">
      <div className="card p-4 p-md-5 col-12 col-md-6">
        <h3 className="mb-4 fw-semibold" style={{ color: "var(--color-text-main)" }}>
          Create Location
        </h3>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Code</label>
            <input className="form-control" value={code} onChange={(e) => setCode(e.target.value)} disabled={loading} />
          </div>
          <div className="col-12">
            <label className="form-label">Name</label>
            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
          </div>
          <div className="col-12">
            <label className="form-label">Address (optional)</label>
            <textarea
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>
          <div className="col-12 form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="loc-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={loading}
            />
            <label className="form-check-label" htmlFor="loc-active">
              Active
            </label>
          </div>
          <div className="col-12 d-flex justify-content-end">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Create Location"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationCreatePage;
export { LocationCreatePage };
