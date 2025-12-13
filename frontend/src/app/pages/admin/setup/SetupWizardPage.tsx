import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../../stores/admin.store";
import { showError, showSuccess } from "../../utils/swal";
import { mapErrorToMessage } from "../../utils/errorMapper";

const steps = ["Create Location", "Create Locker", "Create Compartments"];

const SetupWizardPage = () => {
  const {
    locations,
    lockers,
    lastLocationId,
    lastLockerId,
    loadLocations,
    loadLockers,
    createLocation,
    createLocker,
    createCompartments
  } = useAdminStore((state) => ({
    locations: state.locations,
    lockers: state.lockers,
    lastLocationId: state.lastLocationId,
    lastLockerId: state.lastLockerId,
    loadLocations: state.loadLocations,
    loadLockers: state.loadLockers,
    createLocation: state.createLocation,
    createLocker: state.createLocker,
    createCompartments: state.createCompartments
  }));

  const [step, setStep] = useState(0);
  const [locationName, setLocationName] = useState("");
  const [locationCode, setLocationCode] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationActive, setLocationActive] = useState(true);
  const [lockerCode, setLockerCode] = useState("");
  const [lockerName, setLockerName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocker, setSelectedLocker] = useState("");
  const [rows, setRows] = useState<{ compartment_no: string; size: string }[]>([{ compartment_no: "", size: "M" }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLocations().catch(() => undefined);
    loadLockers().catch(() => undefined);
  }, [loadLocations, loadLockers]);

  useEffect(() => {
    if (lastLocationId) setSelectedLocation(lastLocationId);
  }, [lastLocationId]);

  useEffect(() => {
    if (lastLockerId) setSelectedLocker(lastLockerId);
  }, [lastLockerId]);

  const canNext = useMemo(() => {
    if (step === 0) return Boolean(locationName && locationCode);
    if (step === 1) return Boolean(selectedLocation && lockerCode);
    if (step === 2) return Boolean(selectedLocker && rows.every((r) => r.compartment_no));
    return false;
  }, [step, locationName, locationCode, selectedLocation, lockerCode, selectedLocker, rows]);

  const handleLocationSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      await createLocation({ name: locationName, code: locationCode, address: locationAddress, is_active: locationActive } as any);
      await showSuccess("Location created", "");
      setStep(1);
    } catch (error) {
      await showError("Error", mapErrorToMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleLockerSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      await createLocker({ location_id: selectedLocation, locker_code: lockerCode, name: lockerName });
      await showSuccess("Locker created", "");
      setStep(2);
    } catch (error) {
      await showError("Error", mapErrorToMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCompartmentsSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const compartments = rows.map((row) => ({ compartment_no: row.compartment_no, size: row.size }));
      await createCompartments(selectedLocker, { compartments });
      await showSuccess("Compartments created", "");
    } catch (error) {
      await showError("Error", mapErrorToMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => setRows((prev) => [...prev, { compartment_no: "", size: "M" }]);
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, idx) => idx !== index));
  const updateRow = (index: number, field: "compartment_no" | "size", value: string) =>
    setRows((prev) => prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row)));

  const renderStep = () => {
    if (step === 0) {
      return (
        <form onSubmit={handleLocationSubmit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Code</label>
            <input
              className="form-control"
              value={locationCode}
              onChange={(e) => setLocationCode(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="col-12">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="col-12">
            <label className="form-label">Address (optional)</label>
            <input
              className="form-control"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="col-12 form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="wizard-active"
              checked={locationActive}
              onChange={(e) => setLocationActive(e.target.checked)}
              disabled={loading}
            />
            <label className="form-check-label" htmlFor="wizard-active">
              Active
            </label>
          </div>
        </form>
      );
    }

    if (step === 1) {
      return (
        <form onSubmit={handleLockerSubmit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Location</label>
            <select
              className="form-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              disabled={loading}
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc.location_id} value={loc.location_id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Code</label>
            <input className="form-control" value={lockerCode} onChange={(e) => setLockerCode(e.target.value)} disabled={loading} />
          </div>
          <div className="col-12">
            <label className="form-label">Name (optional)</label>
            <input className="form-control" value={lockerName} onChange={(e) => setLockerName(e.target.value)} disabled={loading} />
          </div>
        </form>
      );
    }

    return (
      <form onSubmit={handleCompartmentsSubmit} className="row g-3">
        <div className="col-12">
          <label className="form-label">Locker</label>
          <select
            className="form-select"
            value={selectedLocker}
            onChange={(e) => setSelectedLocker(e.target.value)}
            disabled={loading}
          >
            <option value="">Select locker</option>
            {lockers.map((locker) => (
              <option key={locker.locker_id} value={locker.locker_id}>
                {locker.locker_code ?? locker.locker_id}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="fw-semibold">Compartments</div>
            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={addRow} disabled={loading}>
              Add Row
            </button>
          </div>
          <div className="d-flex flex-column gap-2">
            {rows.map((row, idx) => (
              <div className="row g-2 align-items-center" key={idx}>
                <div className="col-6 col-md-4">
                  <input
                    className="form-control"
                    placeholder="Compartment No"
                    value={row.compartment_no}
                    onChange={(e) => updateRow(idx, "compartment_no", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="col-4 col-md-3">
                  <select
                    className="form-select"
                    value={row.size}
                    onChange={(e) => updateRow(idx, "size", e.target.value)}
                    disabled={loading}
                  >
                    <option value="S">Small</option>
                    <option value="M">Medium</option>
                    <option value="L">Large</option>
                  </select>
                </div>
                <div className="col-2 col-md-2 d-flex justify-content-end">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    type="button"
                    onClick={() => removeRow(idx)}
                    disabled={loading || rows.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    );
  };

  const handleNext = async () => {
    if (step === 0) {
      await handleLocationSubmit();
    } else if (step === 1) {
      await handleLockerSubmit();
    } else if (step === 2) {
      await handleCompartmentsSubmit();
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3 fw-semibold" style={{ color: "var(--color-text-main)" }}>
        Setup Wizard
      </h3>
      <div className="card p-4 p-md-5">
        <div className="d-flex gap-2 mb-4">
          {steps.map((label, idx) => (
            <div
              key={label}
              className={`px-3 py-2 rounded ${idx === step ? "bg-warning" : "bg-light"}`}
              style={{ border: "1px solid #f0e6b8" }}
            >
              <div className="small text-muted">Step {idx + 1}</div>
              <div className="fw-semibold">{label}</div>
            </div>
          ))}
        </div>

        {renderStep()}

        <div className="d-flex justify-content-between mt-4">
          <button className="btn btn-outline-secondary" onClick={handleBack} disabled={loading || step === 0}>
            Back
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={loading || !canNext}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Working...
              </>
            ) : step === 2 ? (
              "Finish"
            ) : (
              "Next"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupWizardPage;
export { SetupWizardPage };
