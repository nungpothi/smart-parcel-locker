import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store";
import { useParcelStore } from "../../../stores/parcel.store";
import { useUiStore } from "../../../stores/ui.store";
import { showError, showSuccess } from "../../../utils/swal";
import { mapErrorToMessage } from "../../../utils/errorMapper";

const RequestOTPPage = () => {
  const navigate = useNavigate();
  const { userId, phone } = useAuthStore((state) => ({ userId: state.userId, phone: state.phone }));
  const { fetchParcelByRecipient, requestOtp, parcelId, status } = useParcelStore((state) => ({
    fetchParcelByRecipient: state.fetchParcelByRecipient,
    requestOtp: state.requestOtp,
    parcelId: state.parcelId,
    status: state.status
  }));
  const { loading, setLoading } = useUiStore((state) => ({
    loading: state.loading,
    setLoading: state.setLoading
  }));
  const [info, setInfo] = useState<{ message: string | null }>({ message: null });

  const hasParcel = useMemo(() => Boolean(parcelId), [parcelId]);

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setInfo({ message: "No recipient session" });
        return;
      }
      try {
        setLoading(true);
        await fetchParcelByRecipient(userId);
        if (!useParcelStore.getState().parcelId) {
          setInfo({ message: "No parcel ready for pickup" });
        } else {
          setInfo({ message: null });
        }
      } catch (error) {
        setInfo({ message: mapErrorToMessage(error) });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchParcelByRecipient, setLoading, userId]);

  const handleRequestOtp = async () => {
    if (!userId || !hasParcel) return;
    try {
      setLoading(true);
      await requestOtp(undefined, userId);
      await showSuccess("OTP sent", "Please check your phone.");
      navigate("/pickup/verify-otp");
    } catch (error) {
      await showError("Failed to send OTP", mapErrorToMessage(error));
    } finally {
      setLoading(false);
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
          <strong>Parcel ID:</strong> {parcelId ?? "N/A"}
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
