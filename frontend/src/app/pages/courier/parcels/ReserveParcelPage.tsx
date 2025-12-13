import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParcelStore } from "../../../stores/parcel.store";
import { useUiStore } from "../../../stores/ui.store";
import { showError, showSuccess, showWarning } from "../../../utils/swal";
import { APIError } from "../../../services/http";

const ReserveParcelPage = () => {
  const navigate = useNavigate();
  const { parcelId, reserveParcel, compartmentId, expiresAt } = useParcelStore((state) => ({
    parcelId: state.parcelId,
    reserveParcel: state.reserveParcel,
    compartmentId: state.compartmentId,
    expiresAt: state.expiresAt
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

  const handleReserve = async () => {
    if (!parcelId) {
      await showWarning("No parcel in progress", "Please create a parcel first");
      navigate("/courier/parcels/create");
      return;
    }

    try {
      setLoading(true);
      await reserveParcel();
      const updated = useParcelStore.getState();
      await showSuccess(
        "Compartment reserved",
        `Compartment: ${updated.compartmentId ?? "N/A"}${updated.expiresAt ? ` | Expires: ${updated.expiresAt}` : ""}`
      );
      navigate("/courier/parcels/deposit");
    } catch (error) {
      const apiError = error as APIError;
      await showError("Reserve failed", [apiError.message, apiError.errorCode].filter(Boolean).join(" | "));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3 fw-semibold" style={{ color: "var(--color-text-main)" }}>
        Courier - Reserve Compartment
      </h3>
      <div className="card p-4 p-md-5">
        <p className="mb-2">
          <strong>Parcel ID:</strong> {parcelId ?? "N/A"}
        </p>
        <p className="mb-2">
          <strong>Compartment ID:</strong> {compartmentId ?? "N/A"}
        </p>
        {expiresAt ? (
          <p className="mb-3">
            <strong>Expires At:</strong> {expiresAt}
          </p>
        ) : null}
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" onClick={handleReserve} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Reserving...
              </>
            ) : (
              "Reserve"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReserveParcelPage;
export { ReserveParcelPage };
