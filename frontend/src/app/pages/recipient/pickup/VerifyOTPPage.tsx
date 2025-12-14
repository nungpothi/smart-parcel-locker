import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store";
import { useRecipientStore } from "../../../../stores/recipient.store";
import { showError, showSuccess, showWarning } from "../../../utils/swal";
import { mapErrorToMessage } from "../../../utils/errorMapper";

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const recipientId = useAuthStore((state) => state.userId);
  const { parcel, otpRef, loading, fetchParcelByRecipient, verifyOtp } = useRecipientStore((state) => ({
    parcel: state.parcel,
    otpRef: state.otpRef,
    loading: state.loading,
    fetchParcelByRecipient: state.fetchParcelByRecipient,
    verifyOtp: state.verifyOtp
  }));
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    if (!otpRef) {
      navigate("/pickup/request-otp");
      return;
    }
    if (!parcel && recipientId) {
      fetchParcelByRecipient(recipientId).catch(async (error) => {
        await showError("Load failed", mapErrorToMessage(error));
      });
    }
  }, [otpRef, parcel, recipientId, fetchParcelByRecipient, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!otpRef) {
      await showWarning("No OTP", "Request OTP first");
      navigate("/pickup/request-otp");
      return;
    }
    try {
      await verifyOtp(otpCode);
      await showSuccess("OTP verified", "Proceed to pickup");
      navigate("/pickup/result");
    } catch (error) {
      await showError("Verification failed", mapErrorToMessage(error));
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3 fw-semibold" style={{ color: "var(--color-text-main)" }}>
        Verify OTP
      </h3>
      <div className="card p-4 p-md-5">
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label">OTP Code</label>
            <input
              className="form-control"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="d-flex justify-content-end">
            <button className="btn btn-primary" type="submit" disabled={loading || !otpRef}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
export { VerifyOTPPage };
