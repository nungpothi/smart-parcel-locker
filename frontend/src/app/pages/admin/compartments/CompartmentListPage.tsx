import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminStore } from "../../../stores/admin.store";
import { showError } from "../../../utils/swal";
import { mapErrorToMessage } from "../../../utils/errorMapper";

const CompartmentListPage = () => {
  const navigate = useNavigate();
  const { lockerId } = useParams();
  const { compartments, fetchCompartments } = useAdminStore((state) => ({
    compartments: state.compartments,
    fetchCompartments: state.fetchCompartments ?? state.loadCompartments
  }));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!lockerId) return;
      try {
        setLoading(true);
        await fetchCompartments(lockerId);
      } catch (error) {
        await showError("Error", mapErrorToMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchCompartments, lockerId]);

  const goToCreate = () => {
    if (lockerId) {
      navigate(`/admin/lockers/${lockerId}/compartments/create`);
    }
  };

  return (
    <div className="container py-4">
      <div className="card p-4 p-md-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0 fw-semibold" style={{ color: "var(--color-text-main)" }}>
            Compartments
          </h3>
          <button className="btn btn-primary" onClick={goToCreate}>
            Create Compartments
          </button>
        </div>
        {loading ? (
          <p className="text-muted mb-0">Loading compartments...</p>
        ) : compartments.length === 0 ? (
          <p className="text-muted mb-0">No compartments found</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col">Compartment No</th>
                  <th scope="col">Size</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {compartments.map((comp) => (
                  <tr key={comp.compartment_id}>
                    <td>{comp.compartment_no ?? "-"}</td>
                    <td>{comp.size ?? "-"}</td>
                    <td>{comp.status ?? "-"}</td>
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

export default CompartmentListPage;
export { CompartmentListPage };
