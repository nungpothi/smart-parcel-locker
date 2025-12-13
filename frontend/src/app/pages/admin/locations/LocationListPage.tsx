import { useEffect, useState } from "react";
import { useAdminStore } from "../../../stores/admin.store";
import { showError } from "../../../utils/swal";
import { mapErrorToMessage } from "../../../utils/errorMapper";

const LocationListPage = () => {
  const { locations, fetchLocations } = useAdminStore((state) => ({
    locations: state.locations,
    fetchLocations: state.fetchLocations ?? state.loadLocations
  }));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchLocations();
      } catch (error) {
        await showError("Error", mapErrorToMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchLocations]);

  return (
    <div className="container py-4">
      <div className="card p-4 p-md-5">
        <h3 className="mb-4 fw-semibold" style={{ color: "var(--color-text-main)" }}>
          Locations
        </h3>
        {loading ? (
          <p className="text-muted mb-0">Loading locations...</p>
        ) : locations.length === 0 ? (
          <p className="text-muted mb-0">No locations found</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Name</th>
                  <th scope="col">Address</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.location_id}>
                    <td>{loc.code ?? "-"}</td>
                    <td>{loc.name ?? "-"}</td>
                    <td>{loc.address ?? "-"}</td>
                    <td>
                      {loc.is_active ? (
                        <span className="badge badge-soft-green">Active</span>
                      ) : (
                        <span className="badge bg-light text-muted">Inactive</span>
                      )}
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

export default LocationListPage;
export { LocationListPage };
