import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "../../../stores/admin.store";
import { showError } from "../../../utils/swal";
import { mapErrorToMessage } from "../../../utils/errorMapper";

const LockerListPage = () => {
  const navigate = useNavigate();
  const { lockers, fetchLockers } = useAdminStore((state) => ({
    lockers: state.lockers,
    fetchLockers: state.fetchLockers ?? state.loadLockers
  }));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchLockers();
      } catch (error) {
        await showError("Error", mapErrorToMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchLockers]);

  const renderStatus = (status?: string) => {
    if (status === "ACTIVE") return <span className="badge badge-soft-green">ACTIVE</span>;
    if (status === "MAINTENANCE") return <span className="badge badge-soft-yellow">MAINTENANCE</span>;
    return <span className="badge bg-light text-muted">DISABLED</span>;
  };

  return (
    <div className="container py-4">
      <div className="card p-4 p-md-5">
        <h3 className="mb-4 fw-semibold" style={{ color: "var(--color-text-main)" }}>
          Lockers
        </h3>
        {loading ? (
          <p className="text-muted mb-0">Loading lockers...</p>
        ) : lockers.length === 0 ? (
          <p className="text-muted mb-0">No lockers found</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col">Locker Code</th>
                  <th scope="col">Name</th>
                  <th scope="col">Location</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {lockers.map((locker) => (
                  <tr key={locker.locker_id}>
                    <td>{locker.locker_code ?? "-"}</td>
                    <td>{locker.name ?? "-"}</td>
                    <td>{locker.location_name ?? locker.location_id ?? "-"}</td>
                    <td>{renderStatus(locker.status)}</td>
                    <td>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => navigate(`/admin/lockers/${locker.locker_id}/compartments`)}
                      >
                        Manage Compartments
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LockerListPage;
export { LockerListPage };
