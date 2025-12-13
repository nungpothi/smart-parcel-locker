import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Select } from "../../../components/ui/Select";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { useAuthStore } from "../../../stores/auth.store";
import { useParcelStore } from "../../../stores/parcel.store";
import { useUiStore } from "../../../stores/ui.store";
import { listAvailableLockers } from "../../../services/lockers.api";
import { LockerAvailable } from "../../../types/domain";
import { showError, showSuccess, showWarning } from "../../../utils/swal";
import { APIError } from "../../../services/http";

const CreateParcelPage = () => {
  const navigate = useNavigate();
  const courierId = useAuthStore((state) => state.userId);
  const { createParcel } = useParcelStore((state) => ({ createParcel: state.createParcel }));
  const { loading, setLoading } = useUiStore((state) => ({
    loading: state.loading,
    setLoading: state.setLoading
  }));

  const [lockers, setLockers] = useState<LockerAvailable[]>([]);
  const [lockerId, setLockerId] = useState("");
  const [size, setSize] = useState("");
  const [recipientId, setRecipientId] = useState("");

  useEffect(() => {
    const loadLockers = async () => {
      try {
        const res = await listAvailableLockers();
        setLockers(res.lockers ?? []);
      } catch (error) {
        showError("Failed to load lockers", (error as Error).message);
      }
    };
    loadLockers();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!courierId) {
      showWarning("Not authenticated", "Courier ID missing");
      return;
    }
    if (!lockerId || !size || !recipientId) {
      showWarning("Missing fields", "Please complete all fields");
      return;
    }

    try {
      setLoading(true);
      await createParcel({
        locker_id: lockerId,
        size,
        courier_id: courierId,
        recipient_id: recipientId
      } as any);
      const parcelId = useParcelStore.getState().parcelId;
      const status = useParcelStore.getState().status;
      await showSuccess("Parcel created", `Parcel: ${parcelId} | Status: ${status ?? ""}`);
      navigate("/courier/parcels/reserve");
    } catch (error) {
      const apiError = error as APIError;
      await showError("Create failed", [apiError.message, apiError.errorCode].filter(Boolean).join(" | "));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Courier - Create Parcel</h3>
      <div className="card shadow-sm">
        <div className="card-body">
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
                    {locker.locker_code} - {locker.location_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Size</label>
              <select
                className="form-select"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                disabled={loading}
              >
                <option value="">Select size</option>
                <option value="S">Small</option>
                <option value="M">Medium</option>
                <option value="L">Large</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Recipient ID</label>
              <input
                className="form-control"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                placeholder="Recipient UUID"
                disabled={loading}
              />
            </div>

            <div className="col-12 d-flex justify-content-end">
              <button className="btn btn-warning" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Creating...
                  </>
                ) : (
                  "Create Parcel"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateParcelPage;
export { CreateParcelPage };
