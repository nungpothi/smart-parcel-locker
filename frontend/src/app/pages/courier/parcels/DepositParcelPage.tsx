import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
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
    <div style={{ padding: "16px" }}>
      <h1>Courier - Deposit Parcel</h1>
      <Card>
        <p>Parcel ID: {parcelId ?? "N/A"}</p>
        <p>Compartment ID: {compartmentId ?? "N/A"}</p>
        <Button onClick={handleDeposit} disabled={loading}>
          {loading ? "Depositing..." : "Deposit"}
        </Button>
      </Card>
    </div>
  );
};

export default DepositParcelPage;
export { DepositParcelPage };
