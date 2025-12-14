import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecipientStore } from "../../../../stores/recipient.store";
import { showError, showSuccess, showWarning } from "../../../utils/swal";
import { mapErrorToMessage } from "../../../utils/errorMapper";

const PickupResultPage = () => {
  const navigate = useNavigate();
  const { parcel, otpRef, loading, pickupParcel, reset } = useRecipientStore((state) => ({
    parcel: state.parcel,
    otpRef: state.otpRef,
    loading: state.loading,
    pickupParcel: state.pickupParcel,
    reset: state.reset
  }));
  const [completed, setCompleted] = useState(false);

  const parcelId = parcel?.parcel_id;
  const compartmentId = parcel?.compartment_id;
  const expiresAt = parcel?.expires_at;

  const ready = useMemo(() => Boolean(parcelId && otpRef), [parcelId, otpRef]);

  useEffect(() => {
    if (!ready && !completed) {
      navigate("/pickup/request-otp");
    }
  }, [ready, completed, navigate]);

  const handlePickup = async () => {
    if (!ready) {
      await showWarning("No parcel in progress", "Please request OTP first");
      navigate("/pickup/request-otp");
      return;
    }
    try {
      await pickupParcel();
      setCompleted(true);
      await showSuccess("Parcel picked up", "Thank you!");
      reset();
    } catch (error) {
      await showError("Pickup failed", mapErrorToMessage(error));
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3 fw-semibold" style={{ color: "var(--color-text-main)" }}>
        Pickup Parcel
      </h3>
      <div className="card p-4 p-md-5">
        {completed ? (
          <div className="text-center">
            <div className="mb-3">
              <span className="badge bg-warning text-dark px-3 py-2 fs-6">Pickup Complete</span>
            </div>
            <p className="text-muted mb-0">Parcel collected successfully.</p>
          </div>
        ) : (
          <>
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
              <button className="btn btn-primary" onClick={handlePickup} disabled={loading || !ready}>
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
          </>
        )}
      </div>
    </div>
  );
};

export default PickupResultPage;
export { PickupResultPage };
