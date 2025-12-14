import { useEffect } from "react";
import { useRecipientStore } from "../../stores/recipient.store";
import { useAuthStore } from "../../app/stores/auth.store";
import { showError, showSuccess, showWarning } from "../../app/utils/swal";
import { mapErrorToMessage } from "../../utils/errorMapper";

const RecipientParcelPage = () => {
  const recipientId = useAuthStore((state) => state.userId);
  const { parcel, otpRef, loading, pickedUp, loadParcel, requestOtp, pickupParcel, reset } = useRecipientStore(
    (state) => ({
      parcel: state.parcel,
      otpRef: state.otpRef,
      loading: state.loading,
      pickedUp: state.pickedUp,
      loadParcel: state.loadParcel,
      requestOtp: state.requestOtp,
      pickupParcel: state.pickupParcel,
      reset: state.reset
    })
  );

  useEffect(() => {
    if (!recipientId) return;
    loadParcel(recipientId).catch(async (error) => {
      await showError("Load failed", mapErrorToMessage(error));
    });
  }, [recipientId, loadParcel]);

  const handleRefresh = async () => {
    if (!recipientId) {
      await showWarning("Not authenticated", "Sign in to view parcels");
      return;
    }
    try {
      await loadParcel(recipientId);
    } catch (error) {
      await showError("Load failed", mapErrorToMessage(error));
    }
  };

  const handleRequestOtp = async () => {
    if (!parcel) {
      await showWarning("No parcel", "No active parcel found");
      return;
    }
    try {
      const ref = await requestOtp();
      await showSuccess("OTP requested", `Reference: ${ref}`);
    } catch (error) {
      await showError("OTP request failed", mapErrorToMessage(error));
    }
  };

  const handlePickup = async () => {
    if (!parcel) {
      await showWarning("No parcel", "No active parcel found");
      return;
    }
    if (!otpRef) {
      await showWarning("OTP required", "Request OTP before pickup");
      return;
    }
    try {
      await pickupParcel();
      await showSuccess("Pickup successful", "Parcel collected");
    } catch (error) {
      await showError("Pickup failed", mapErrorToMessage(error));
    }
  };

  const renderDetails = () => (
    <div className="bg-warning-subtle rounded-4 p-3">
      <div className="d-flex justify-content-between mb-2">
        <span className="text-muted">Parcel Code</span>
        <span className="fw-semibold text-dark">{parcel?.parcel_code ?? "-"}</span>
      </div>
      <div className="d-flex justify-content-between mb-2">
        <span className="text-muted">Locker</span>
        <span className="fw-semibold text-dark">{parcel?.locker_id ?? "-"}</span>
      </div>
      <div className="d-flex justify-content-between mb-2">
        <span className="text-muted">Compartment</span>
        <span className="fw-semibold text-dark">{parcel?.compartment_id ?? "TBD"}</span>
      </div>
      <div className="d-flex justify-content-between mb-2">
        <span className="text-muted">Expires At</span>
        <span className="fw-semibold text-dark">{parcel?.expires_at ?? "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="text-muted">Status</span>
        <span className="fw-semibold text-dark">{parcel?.status ?? "-"}</span>
      </div>
    </div>
  );

  const renderActions = () => (
    <div className="d-flex flex-column flex-md-row gap-3">
      {!otpRef ? (
        <button className="btn btn-warning text-dark px-4" onClick={handleRequestOtp} disabled={loading || !parcel}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Processing
            </>
          ) : (
            "Request OTP"
          )}
        </button>
      ) : (
        <button
          className="btn btn-primary px-4"
          onClick={handlePickup}
          disabled={loading || !parcel || !otpRef}
          style={{ backgroundColor: "#ffe08a", border: "none", color: "#4a4a4a" }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Processing
            </>
          ) : (
            "Pickup Parcel"
          )}
        </button>
      )}
    </div>
  );

  if (pickedUp) {
    return (
      <div className="container py-4" style={{ background: "linear-gradient(180deg, #fff9e6 0%, #fff3c4 100%)" }}>
        <div className="card p-4 border-0 shadow-sm text-center" style={{ backgroundColor: "#fffaf0" }}>
          <div className="mb-3">
            <span className="badge bg-warning text-dark px-3 py-2 fs-6">Pickup Complete</span>
          </div>
          <h3 className="fw-semibold mb-2" style={{ color: "var(--color-text-main)" }}>
            Parcel collected successfully
          </h3>
          <p className="text-muted mb-4">You can request a new OTP if another parcel arrives.</p>
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-warning text-dark px-4"
              onClick={() => {
                reset();
                handleRefresh();
              }}
              disabled={loading}
            >
              Check for new parcel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ background: "linear-gradient(180deg, #fff9e6 0%, #fff3c4 100%)" }}>
      <div className="d-flex flex-column gap-3 mb-3">
        <div className="text-uppercase small text-muted">Recipient</div>
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between">
          <h3 className="fw-semibold mb-2" style={{ color: "var(--color-text-main)" }}>
            My Parcel
          </h3>
          <button className="btn btn-link text-decoration-none text-dark" onClick={handleRefresh} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      <div className="card p-4 border-0 shadow-sm" style={{ backgroundColor: "#fffaf0" }}>
        {loading ? (
          <div className="d-flex align-items-center gap-2 text-muted">
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Loading parcel...
          </div>
        ) : null}

        {!loading && !parcel ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <span className="badge bg-light text-dark px-3 py-2">No active parcel</span>
            </div>
            <p className="text-muted mb-4">You have no parcel ready for pickup.</p>
            <button className="btn btn-warning text-dark px-4" onClick={handleRefresh} disabled={loading}>
              Check again
            </button>
          </div>
        ) : null}

        {!loading && parcel ? (
          <div className="d-flex flex-column gap-4">
            {renderDetails()}
            <div className="d-flex align-items-center justify-content-between">
              <div className="text-muted small">
                {otpRef ? `OTP reference: ${otpRef}` : "Request an OTP to enable pickup."}
              </div>
              <div className="d-flex gap-2 align-items-center">
                <div className="text-muted small">Status: {parcel.status}</div>
              </div>
            </div>
            {renderActions()}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RecipientParcelPage;
export { RecipientParcelPage };
