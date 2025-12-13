import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useParcelStore } from "../../../stores/parcel.store";
import { useUiStore } from "../../../stores/ui.store";
import { showError, showSuccess, showWarning } from "../../../utils/swal";
import { APIError } from "../../../services/http";

const ReadyParcelPage = () => {
  const navigate = useNavigate();
  const { parcelId, status, readyParcel, resetParcel } = useParcelStore((state) => ({
    parcelId: state.parcelId,
    status: state.status,
    readyParcel: state.readyParcel,
    resetParcel: state.resetParcel
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

  const handleReady = async () => {
    if (!parcelId) {
      await showWarning("No parcel in progress", "Please create a parcel first");
      navigate("/courier/parcels/create");
      return;
    }

    try {
      setLoading(true);
      await readyParcel();
      const updatedStatus = useParcelStore.getState().status;
      await showSuccess("Parcel marked ready", `Status: ${updatedStatus ?? "PICKUP_READY"}`);
    } catch (error) {
      const apiError = error as APIError;
      await showError("Mark ready failed", [apiError.message, apiError.errorCode].filter(Boolean).join(" | "));
    } finally {
      setLoading(false);
    }
  };

  const handleNewParcel = () => {
    resetParcel();
    navigate("/courier/parcels/create");
  };

  return (
    <div style={{ padding: "16px" }}>
      <h1>Courier - Mark Pickup Ready</h1>
      <Card>
        <p>Parcel ID: {parcelId ?? "N/A"}</p>
        <p>Status: {status ?? "N/A"}</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button onClick={handleReady} disabled={loading}>
            {loading ? "Updating..." : "Mark Ready"}
          </Button>
          <Button type="button" onClick={handleNewParcel} disabled={loading}>
            Start New Parcel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ReadyParcelPage;
export { ReadyParcelPage };
