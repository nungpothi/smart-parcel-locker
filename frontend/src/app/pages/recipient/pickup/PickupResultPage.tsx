import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParcelStore } from "../../../stores/parcel.store";
import { useUiStore } from "../../../stores/ui.store";
import { showError, showSuccess, showWarning } from "../../../utils/swal";
import { mapErrorToMessage } from "../../../utils/errorMapper";

const PickupResultPage = () => {
  const navigate = useNavigate();
  const { parcelId, pickupParcel, resetParcel, compartmentId, expiresAt } = useParcelStore((state) => ({
    parcelId: state.parcelId,
    pickupParcel: state.pickupParcel,
    resetParcel: state.resetParcel,
    compartmentId: state.compartmentId,
    expiresAt: state.expiresAt
  }));
  const { loading, setLoading } = useUiStore((state) => ({
    loading: state.loading,
    setLoading: state.setLoading
  }));

  useEffect(() => {
    if (!parcelId) {
      showWarning("No parcel in progress", "Please request OTP first").then(() => navigate("/pickup/request-otp"));
    }
  }, [navigate, parcelId]);

  const handlePickup = async () => {
    if (!parcelId) {
      await showWarning("No parcel in progress", "Please request OTP first");
      navigate("/pickup/request-otp");
      return;
    }
    try {
      setLoading(true);
      await pickupParcel(parcelId, parcelId);
      await showSuccess("Parcel picked up", "Thank you!");
      resetParcel();
    } catch (error) {
      await showError("Pickup failed", mapErrorToMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3 fw-semibold" style={{ color: "var(--color-text-main)" }}>
        Pickup Parcel
      </h3>
      <div className="card p-4 p-md-5">
        <p className="mb-2">
          <strong>Parcel ID:</strong> {parcelId ?? "N/A"}
        </p>
        <p className="mb-2">
          <strong>Compartment ID:</strong> {compartmentId ?? "N/A"}
        </p>
        <p className="mb-3">
          <strong>Expires At:</strong> {expiresAt ?? "N/A"}
        </p>
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" onClick={handlePickup} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Picking up...
              </>
            ) : (
              "Pickup Parcel"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickupResultPage;
export { PickupResultPage };
