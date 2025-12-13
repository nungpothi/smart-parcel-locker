import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParcelStore } from "../../../stores/parcel.store";
import { useUiStore } from "../../../stores/ui.store";
import { showError, showSuccess, showWarning } from "../../../utils/swal";
import { APIError } from "../../../services/http";

const DepositParcelPage = () => {
  const navigate = useNavigate();
  const { parcelId, compartmentId, depositParcel, status } = useParcelStore((state) => ({
    parcelId: state.parcelId,
    compartmentId: state.compartmentId,
    depositParcel: state.depositParcel,
    status: state.status
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

  const handleDeposit = async () => {
    if (!parcelId) {
      await showWarning("No parcel in progress", "Please create a parcel first");
      navigate("/courier/parcels/create");
      return;
    }

    try {
      setLoading(true);
      await depositParcel();
      const updated = useParcelStore.getState();
      await showSuccess("Parcel deposited", `Status: ${updated.status ?? status ?? "N/A"}`);
      navigate("/courier/parcels/ready");
    } catch (error) {
      const apiError = error as APIError;
      await showError("Deposit failed", [apiError.message, apiError.errorCode].filter(Boolean).join(" | "));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3 fw-semibold" style={{ color: "var(--color-text-main)" }}>
        Courier - Deposit Parcel
      </h3>
      <div className="card p-4 p-md-5">
        <p className="mb-2">
          <strong>Parcel ID:</strong> {parcelId ?? "N/A"}
        </p>
        <p className="mb-3">
          <strong>Compartment ID:</strong> {compartmentId ?? "N/A"}
        </p>
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" onClick={handleDeposit} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Depositing...
              </>
            ) : (
              "Deposit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositParcelPage;
export { DepositParcelPage };
