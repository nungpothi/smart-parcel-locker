import { useEffect, useMemo } from "react";
import { useCourierStore } from "../../stores/courier.store";
import { useAuthStore } from "../../app/stores/auth.store";
import { showError, showSuccess, showWarning } from "../../app/utils/swal";
import { mapErrorToMessage } from "../../utils/errorMapper";

const StepHeader = ({ step, title, active }: { step: number; title: string; active: boolean }) => (
  <div className="d-flex flex-column align-items-center text-center" style={{ minWidth: 140 }}>
    <div
      className={`rounded-circle d-flex align-items-center justify-content-center fw-semibold mb-2 ${
        active ? "bg-warning text-dark" : "bg-light text-secondary"
      }`}
      style={{ width: 44, height: 44, border: "2px solid #ffd54f" }}
    >
      {step}
    </div>
    <span className={`small ${active ? "fw-semibold text-dark" : "text-muted"}`}>{title}</span>
  </div>
);

const Stepper = ({ current }: { current: number }) => (
  <div className="d-flex align-items-center justify-content-between mb-4">
    <StepHeader step={1} title="Select Locker" active={current === 1} />
    <div className="flex-grow-1 mx-2" style={{ height: 2, background: "#ffe08a" }} />
    <StepHeader step={2} title="Parcel Info" active={current === 2} />
    <div className="flex-grow-1 mx-2" style={{ height: 2, background: "#ffe08a" }} />
    <StepHeader step={3} title="Confirm Deposit" active={current >= 3 && current < 4} />
  </div>
);

const DepositWizardPage = () => {
  const authCourierId = useAuthStore((state) => state.userId);

  const {
    step,
    lockers,
    lockerId,
    size,
    useSelfRecipient,
    recipientId,
    compartmentId,
    status,
    summary,
    loadingLockers,
    submitting,
    setLockerId,
    setSize,
    setUseSelfRecipient,
    setRecipientId,
    setStep,
    loadLockers,
    completeDeposit,
    resetWizard
  } = useCourierStore((state) => ({
    step: state.step,
    lockers: state.lockers,
    lockerId: state.lockerId,
    size: state.size,
    useSelfRecipient: state.useSelfRecipient,
    recipientId: state.recipientId,
    compartmentId: state.compartmentId,
    status: state.status,
    summary: state.summary,
    loadingLockers: state.loadingLockers,
    submitting: state.submitting,
    setLockerId: state.setLockerId,
    setSize: state.setSize,
    setUseSelfRecipient: state.setUseSelfRecipient,
    setRecipientId: state.setRecipientId,
    setStep: state.setStep,
    loadLockers: state.loadLockers,
    completeDeposit: state.completeDeposit,
    resetWizard: state.resetWizard
  }));

  const recipientValue = useMemo(
    () => (useSelfRecipient ? authCourierId ?? "" : recipientId.trim()),
    [authCourierId, recipientId, useSelfRecipient]
  );

  useEffect(() => {
    loadLockers().catch(async (error) => {
      await showError("Failed to load lockers", mapErrorToMessage(error));
    });
  }, [loadLockers]);

  useEffect(() => {
    if (!authCourierId && useSelfRecipient) {
      setUseSelfRecipient(false);
    }
  }, [authCourierId, useSelfRecipient, setUseSelfRecipient]);

  const handleNext = async () => {
    if (step === 1) {
      if (!lockerId) {
        await showWarning("Select a locker", "Choose an available locker to continue");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!size) {
        await showWarning("Select size", "Choose parcel size to continue");
        return;
      }
      if (!recipientValue) {
        await showWarning("Recipient required", "Pick a recipient option to continue");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 1 || submitting) return;
    setStep((step - 1) as 1 | 2 | 3 | 4);
  };

  const handleConfirm = async () => {
    if (!lockerId) {
      await showWarning("Select a locker", "Choose an available locker to continue");
      setStep(1);
      return;
    }
    if (!size) {
      await showWarning("Select size", "Choose parcel size to continue");
      setStep(2);
      return;
    }
    if (!recipientValue) {
      await showWarning("Recipient required", "Pick a recipient option to continue");
      setStep(2);
      return;
    }
    if (!authCourierId) {
      await showWarning("Not authenticated", "Sign in as courier to deposit");
      return;
    }
    try {
      const result = await completeDeposit(authCourierId, recipientValue);
      await showSuccess("Deposit complete", `Parcel ${result.parcelId}`);
    } catch (error) {
      await showError("Deposit failed", mapErrorToMessage(error));
    }
  };

  const handleRestart = () => {
    resetWizard();
    loadLockers().catch(() => {});
  };

  const renderLockerList = () => (
    <div className="row g-3">
      {lockers.map((locker) => (
        <div key={locker.locker_id} className="col-12 col-md-6">
          <label
            className={`w-100 p-3 border rounded-4 d-flex align-items-center justify-content-between ${
              lockerId === locker.locker_id ? "bg-warning-subtle border-warning" : "bg-light"
            }`}
            style={{ cursor: "pointer", borderColor: lockerId === locker.locker_id ? "#ffd54f" : "#f0e6b8" }}
          >
            <div className="d-flex align-items-start gap-3">
              <input
                type="radio"
                name="locker"
                className="form-check-input mt-2"
                checked={lockerId === locker.locker_id}
                onChange={() => setLockerId(locker.locker_id)}
                disabled={submitting}
              />
              <div>
                <div className="fw-semibold text-dark">{locker.locker_code}</div>
                <div className="text-muted small">{locker.location_name}</div>
              </div>
            </div>
            <span className="badge bg-warning text-dark">Available</span>
          </label>
        </div>
      ))}
      {lockers.length === 0 && !loadingLockers ? (
        <div className="col-12 text-center text-muted">No lockers available</div>
      ) : null}
    </div>
  );

  const renderSizeSelector = () => (
    <div className="d-flex gap-3 flex-wrap">
      {["S", "M", "L"].map((option) => (
        <button
          key={option}
          type="button"
          className={`btn ${size === option ? "btn-warning" : "btn-outline-secondary"} px-4 py-2 fw-semibold`}
          onClick={() => setSize(option as "S" | "M" | "L")}
          disabled={submitting}
        >
          {option === "S" ? "Small (S)" : option === "M" ? "Medium (M)" : "Large (L)"}
        </button>
      ))}
    </div>
  );

  const renderRecipientSelector = () => (
    <div className="d-flex flex-column gap-3">
      <div
        className={`p-3 rounded-4 border ${useSelfRecipient ? "border-warning bg-warning-subtle" : "border-light"}`}
        style={{ borderColor: useSelfRecipient ? "#ffd54f" : "#f0e6b8" }}
      >
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="recipient"
            id="recipientSelf"
            checked={useSelfRecipient}
            onChange={() => setUseSelfRecipient(true)}
            disabled={!authCourierId || submitting}
          />
          <label className="form-check-label" htmlFor="recipientSelf">
            Use my courier account {authCourierId ? `(ID: ${authCourierId})` : "(Unavailable)"}
          </label>
        </div>
      </div>
      <div
        className={`p-3 rounded-4 border ${!useSelfRecipient ? "border-warning bg-warning-subtle" : "border-light"}`}
        style={{ borderColor: !useSelfRecipient ? "#ffd54f" : "#f0e6b8" }}
      >
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="radio"
            name="recipient"
            id="recipientManual"
            checked={!useSelfRecipient}
            onChange={() => setUseSelfRecipient(false)}
            disabled={submitting}
          />
          <label className="form-check-label" htmlFor="recipientManual">
            Enter recipient ID manually
          </label>
        </div>
        <input
          className="form-control"
          placeholder="Recipient UUID"
          value={useSelfRecipient ? "" : recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          disabled={useSelfRecipient || submitting}
        />
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="bg-warning-subtle rounded-4 p-3">
      <div className="d-flex justify-content-between mb-2">
        <span className="text-muted">Locker</span>
        <span className="fw-semibold text-dark">{lockerId || "-"}</span>
      </div>
      <div className="d-flex justify-content-between mb-2">
        <span className="text-muted">Size</span>
        <span className="fw-semibold text-dark">{size || "-"}</span>
      </div>
      <div className="d-flex justify-content-between mb-2">
        <span className="text-muted">Recipient</span>
        <span className="fw-semibold text-dark">{recipientValue || "-"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="text-muted">Status</span>
        <span className="fw-semibold text-dark">{status || "PENDING"}</span>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="d-flex justify-content-between align-items-center mt-4">
      <button className="btn btn-outline-secondary" onClick={handleBack} disabled={step === 1 || submitting}>
        Back
      </button>
      {step < 3 ? (
        <button className="btn btn-warning text-dark" onClick={handleNext} disabled={submitting}>
          Next
        </button>
      ) : (
        <button className="btn btn-warning text-dark" onClick={handleConfirm} disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Processing
            </>
          ) : (
            "Confirm & Deposit"
          )}
        </button>
      )}
    </div>
  );

  if (step === 4 && summary) {
    return (
      <div
        className="container py-5"
        style={{
          background: "linear-gradient(180deg, #fff9e6 0%, #fff3c4 100%)",
          borderRadius: "24px"
        }}
      >
        <div className="card border-0 shadow-sm p-4 text-center" style={{ backgroundColor: "#fffaf0" }}>
          <div className="mb-3">
            <span className="badge bg-warning text-dark px-3 py-2 fs-6">Deposit Successful</span>
          </div>
          <h3 className="fw-semibold mb-2" style={{ color: "var(--color-text-main)" }}>
            Parcel Stored Securely
          </h3>
          <p className="text-muted mb-4">Share the parcel ID with the recipient to proceed with pickup.</p>
          <div className="bg-warning-subtle rounded-4 p-3 mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Parcel ID</span>
              <span className="fw-semibold text-dark">{summary.parcelId}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Compartment</span>
              <span className="fw-semibold text-dark">{summary.compartmentId ?? "TBD"}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Status</span>
              <span className="fw-semibold text-dark">{summary.status ?? "STORED"}</span>
            </div>
          </div>
          <button className="btn btn-warning text-dark px-4" onClick={handleRestart}>
            Start New Deposit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container py-4"
      style={{
        background: "linear-gradient(180deg, #fff9e6 0%, #fff3c4 100%)",
        borderRadius: "24px"
      }}
    >
      <div className="d-flex flex-column gap-3 mb-3">
        <div className="text-uppercase small text-muted">Courier</div>
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between">
          <h3 className="fw-semibold mb-2" style={{ color: "var(--color-text-main)" }}>
            Deposit Parcel
          </h3>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-warning text-dark px-3 py-2">Pastel Yellow</span>
            <span className="text-muted small">Route: /courier/deposit</span>
          </div>
        </div>
      </div>

      <div className="card p-4 shadow-sm border-0" style={{ backgroundColor: "#fffaf0" }}>
        <Stepper current={step} />

        {step === 1 ? (
          <>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">Choose a locker</h5>
              {loadingLockers ? (
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  Loading
                </div>
              ) : (
                <button
                  className="btn btn-link text-decoration-none text-dark"
                  onClick={() => loadLockers().catch(() => {})}
                  disabled={submitting}
                >
                  Refresh
                </button>
              )}
            </div>
            {renderLockerList()}
          </>
        ) : null}

        {step === 2 ? (
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <h5 className="mb-3">Parcel size</h5>
              {renderSizeSelector()}
            </div>
            <div className="col-12 col-lg-6">
              <h5 className="mb-3">Recipient</h5>
              {renderRecipientSelector()}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <h5 className="mb-3">Review details</h5>
              {renderSummary()}
            </div>
            <div className="col-12 col-lg-5">
              <div className="bg-light rounded-4 p-3">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 48, height: 48, backgroundColor: "#ffe08a" }}
                  >
                    <span className="fw-semibold text-dark">3</span>
                  </div>
                  <div>
                    <div className="fw-semibold text-dark">3-step flow</div>
                    <div className="text-muted small">Create, reserve, deposit in order</div>
                  </div>
                </div>
                <ul className="list-unstyled mb-0 text-muted small">
                  <li className="mb-2">• Validate inputs before moving forward</li>
                  <li className="mb-2">• Errors show instantly with alerts</li>
                  <li className="mb-2">• Success resets the wizard</li>
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {renderFooter()}
      </div>
    </div>
  );
};

export default DepositWizardPage;
export { DepositWizardPage };
