import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../../stores/admin.store";
import { showError } from "../../utils/swal";
import { mapErrorToMessage } from "../../utils/errorMapper";

const statsConfig = [
  { key: "total_locations", label: "Locations" },
  { key: "total_lockers", label: "Lockers" },
  { key: "total_compartments", label: "Compartments" },
  { key: "compartments_available", label: "Available Compartments" },
  { key: "parcels_active", label: "Active Parcels" },
  { key: "parcels_expired", label: "Expired Parcels" }
] as const;

const OverviewPage = () => {
  const { overview, fetchOverview } = useAdminStore((state) => ({
    overview: state.overview,
    fetchOverview: state.fetchOverview ?? state.loadOverview
  }));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchOverview();
      } catch (error) {
        await showError("Error", mapErrorToMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchOverview]);

  const stats = useMemo(() => {
    const metrics = overview || {};
    return statsConfig.map((cfg) => ({
      ...cfg,
      value: (metrics as Record<string, number>)[cfg.key] ?? 0
    }));
  }, [overview]);

  return (
    <div className="container py-4">
      <h3 className="mb-3 fw-semibold" style={{ color: "var(--color-text-main)" }}>
        System Overview
      </h3>
      <div className="card p-4 p-md-5">
        {loading ? (
          <p className="text-muted mb-0">Loading...</p>
        ) : (
          <div className="row g-3">
            {stats.map((stat) => (
              <div className="col-12 col-md-4" key={stat.key}>
                <div className="p-3 rounded" style={{ backgroundColor: "#fff4cc", border: "1px solid #f0e6b8" }}>
                  <div className="text-uppercase small text-muted">{stat.label}</div>
                  <div className="fs-3 fw-bold" style={{ color: "var(--color-text-main)" }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewPage;
export { OverviewPage };
