import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store";
import { useRecipientStore } from "../../../../stores/recipient.store";
import { showError, showSuccess, showWarning } from "../../../utils/swal";
import { mapErrorToMessage } from "../../../utils/errorMapper";

const RequestOTPPage = () => {
  const navigate = useNavigate();
  const { userId, phone } = useAuthStore((state) => ({ userId: state.userId, phone: state.phone }));
  const { parcel, status, fetchParcelByRecipient, requestOtp, loading } = useRecipientStore((state) => ({
    parcel: state.parcel,
    status: state.parcel?.status ?? null,
    fetchParcelByRecipient: state.fetchParcelByRecipient,
    requestOtp: state.requestOtp,
    loading: state.loading
  }));
  const [info, setInfo] = useState<{ message: string | null }>({ message: null });

  const hasParcel = useMemo(() => Boolean(parcel?.parcel_id), [parcel]);

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setInfo({ message: "No recipient session" });
        return;
      }
      try {
        await fetchParcelByRecipient(userId);
        if (!useRecipientStore.getState().parcel) {
          setInfo({ message: "No parcel ready for pickup" });
        } else {
          setInfo({ message: null });
        }
      } catch (error) {
        setInfo({ message: mapErrorToMessage(error) });
      }
    };
    load();
  }, [fetchParcelByRecipient, userId]);

  const handleRequestOtp = async () => {
    if (!userId) {
      await showWarning("Not authenticated", "Please sign in");
      return;
    }
    if (!hasParcel) {
      await showWarning("No parcel", "No active parcel found");
      return;
    }
    try {
      const ref = await requestOtp();
      await showSuccess("OTP sent", `Reference: ${ref}`);
      navigate("/pickup/verify-otp");
    } catch (error) {
      await showError("Failed to send OTP", mapErrorToMessage(error));
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3 fw-semibold" style={{ color: "var(--color-text-main)" }}>
        Receive Parcel
      </h3>
      <div className="card p-4 p-md-5">
        <p className="mb-2">
          <strong>Recipient:</strong> {phone ?? "Unknown"}
        </p>
        <p className="mb-2">
          <strong>Parcel ID:</strong> {parcel?.parcel_id ?? "N/A"}
        </p>
        <p className="mb-3">
          <strong>Status:</strong> {status ?? "N/A"}
        </p>
        {info.message ? <p className="text-muted mb-3">{info.message}</p> : null}
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" onClick={handleRequestOtp} disabled={loading || !hasParcel}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Sending...
              </>
            ) : (
              "Request OTP"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestOTPPage;
export { RequestOTPPage };
