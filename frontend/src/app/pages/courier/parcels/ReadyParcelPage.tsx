import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParcelStore } from "../../../stores/parcel.store";
import { useUiStore } from "../../../stores/ui.store";
import { showError, showSuccess, showWarning } from "../../../utils/swal";
import { mapErrorToMessage } from "../../../utils/errorMapper";
import { APIError } from "../../../services/http";

const ReadyParcelPage = () => {
  const navigate = useNavigate();
  const { parcelId, status, readyParcel, resetParcel } = useParcelStore((state) => ({
    parcelId: state.parcelId,
    status: state.status,
    readyParcel: state.readyParcel,
    resetParcel: state.resetParcel
  }));
  const { loading, setLoading } = useUiStore((state) => ({
    loading: state.loading,
    setLoading: state.setLoading
  }));

  useEffect(() => {
    if (!parcelId) {
      showWarning("No parcel in progress", "Please create a parcel first").then(() => {
        navigate("/courier/parcels/create");
      });
    }
  }, [parcelId, navigate]);

  const handleReady = async () => {
    if (!parcelId) {
      await showWarning("No parcel in progress", "Please create a parcel first");
      navigate("/courier/parcels/create");
      return;
    }

    try {
      setLoading(true);
      await readyParcel();
      const updatedStatus = useParcelStore.getState().status;
      await showSuccess("Parcel marked ready", `Status: ${updatedStatus ?? "PICKUP_READY"}`);
    } catch (error) {
      await showError("Mark ready failed", mapErrorToMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleNewParcel = () => {
    resetParcel();
    navigate("/courier/parcels/create");
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3 fw-semibold" style={{ color: "var(--color-text-main)" }}>
        Courier - Mark Pickup Ready
      </h3>
      <div className="card p-4 p-md-5">
        <p className="mb-2">
          <strong>Parcel ID:</strong> {parcelId ?? "N/A"}
        </p>
        <p className="mb-3">
          <strong>Status:</strong> {status ?? "N/A"}
        </p>
        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-primary" onClick={handleReady} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Updating...
              </>
            ) : (
              "Mark Ready"
            )}
          </button>
          <button className="btn btn-outline-secondary" type="button" onClick={handleNewParcel} disabled={loading}>
            Start New Parcel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadyParcelPage;
export { ReadyParcelPage };
