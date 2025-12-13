import { FormEvent, useEffect, useState } from "react";
import { useAdminStore } from "../../../stores/admin.store";
import { showError, showSuccess } from "../../../utils/swal";
import { mapErrorToMessage } from "../../../utils/errorMapper";

const LockerCreatePage = () => {
  const { locations, loadLocations, createLocker, lastLocationId, fetchLocations } = useAdminStore((state) => ({
    locations: state.locations,
    loadLocations: state.loadLocations,
    fetchLocations: state.fetchLocations ?? state.loadLocations,
    createLocker: state.createLocker,
    lastLocationId: state.lastLocationId
  }));
  const [locationId, setLocationId] = useState("");
  const [lockerCode, setLockerCode] = useState("");
  const [lockerName, setLockerName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (!locations.length) {
          await fetchLocations();
        } else {
          await loadLocations();
        }
        if (lastLocationId) {
          setLocationId(lastLocationId);
        }
      } catch (error) {
        await showError("Error", mapErrorToMessage(error));
      }
    };
    load();
  }, [fetchLocations, lastLocationId, loadLocations, locations.length]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!locationId || !lockerCode) return;
    try {
      setLoading(true);
      await createLocker({ location_id: locationId, locker_code: lockerCode, name: lockerName });
      await showSuccess("Locker created", "Locker has been added.");
      setLockerCode("");
      setLockerName("");
    } catch (error) {
      await showError("Error", mapErrorToMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3 fw-semibold" style={{ color: "var(--color-text-main)" }}>
        Create Locker
      </h3>
      <div className="card p-4 p-md-5">
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Location</label>
            <select
              className="form-select"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              disabled={loading}
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc.location_id} value={loc.location_id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Code</label>
            <input
              className="form-control"
              value={lockerCode}
              onChange={(e) => setLockerCode(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="col-12">
            <label className="form-label">Name (optional)</label>
            <input className="form-control" value={lockerName} onChange={(e) => setLockerName(e.target.value)} disabled={loading} />
          </div>
          <div className="col-12 d-flex justify-content-end">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Create Locker"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LockerCreatePage;
export { LockerCreatePage };
