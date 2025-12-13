import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParcelStore } from "../../../stores/parcel.store";
import { useUiStore } from "../../../stores/ui.store";
import { showError, showSuccess, showWarning } from "../../../utils/swal";

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const { parcelId, verifyOtp } = useParcelStore((state) => ({
    parcelId: state.parcelId,
    verifyOtp: state.verifyOtp
  }));
  const { loading, setLoading } = useUiStore((state) => ({
    loading: state.loading,
    setLoading: state.setLoading
  }));
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    if (!parcelId) {
      showWarning("No parcel in progress", "Please request OTP first").then(() => navigate("/pickup/request-otp"));
    }
  }, [navigate, parcelId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!parcelId) {
      await showWarning("No parcel in progress", "Please request OTP first");
      navigate("/pickup/request-otp");
      return;
    }
    try {
      setLoading(true);
      await verifyOtp(parcelId, otpCode);
      await showSuccess("OTP verified", "Proceed to pickup");
      navigate("/pickup/result");
    } catch (error) {
      await showError("Verification failed", (error as Error).message);
    } finally {
      setLoading(false);
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
            <button className="btn btn-primary" type="submit" disabled={loading}>
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
