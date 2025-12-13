import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useParcelStore } from "../../../stores/parcel.store";
import { useUiStore } from "../../../stores/ui.store";
import { showError, showSuccess, showWarning } from "../../../utils/swal";
import { APIError } from "../../../services/http";

const ReserveParcelPage = () => {
  const navigate = useNavigate();
  const { parcelId, reserveParcel, compartmentId, expiresAt } = useParcelStore((state) => ({
    parcelId: state.parcelId,
    reserveParcel: state.reserveParcel,
    compartmentId: state.compartmentId,
    expiresAt: state.expiresAt
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

  const handleReserve = async () => {
    if (!parcelId) {
      await showWarning("No parcel in progress", "Please create a parcel first");
      navigate("/courier/parcels/create");
      return;
    }

    try {
      setLoading(true);
      await reserveParcel();
      const updated = useParcelStore.getState();
      await showSuccess(
        "Compartment reserved",
        `Compartment: ${updated.compartmentId ?? "N/A"}${updated.expiresAt ? ` | Expires: ${updated.expiresAt}` : ""}`
      );
      navigate("/courier/parcels/deposit");
    } catch (error) {
      const apiError = error as APIError;
      await showError("Reserve failed", [apiError.message, apiError.errorCode].filter(Boolean).join(" | "));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <h1>Courier - Reserve Compartment</h1>
      <Card>
        <p>Parcel ID: {parcelId ?? "N/A"}</p>
        <p>Compartment ID: {compartmentId ?? "N/A"}</p>
        {expiresAt ? <p>Expires At: {expiresAt}</p> : null}
        <Button onClick={handleReserve} disabled={loading}>
          {loading ? "Reserving..." : "Reserve"}
        </Button>
      </Card>
    </div>
  );
};

export default ReserveParcelPage;
export { ReserveParcelPage };
