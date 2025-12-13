import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { Role } from "../../types/domain";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore((state) => ({ register: state.register }));

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("COURIER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await register(phone, password, role);
      navigate("/login");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="card shadow-sm" style={{ maxWidth: "420px", width: "100%" }}>
        <div className="card-header text-center">
          <h5 className="mb-0">Smart Parcel Locker</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div>
              <label className="form-label">Phone</label>
              <input
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                disabled={loading}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="COURIER">COURIER</option>
                <option value="RECIPIENT">RECIPIENT</option>
              </select>
            </div>
            {error ? (
              <div className="alert alert-danger py-2 mb-0" role="alert">
                {error}
              </div>
            ) : null}
            <button className="btn btn-warning w-100" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>
          <div className="mt-3 text-center">
            <button className="btn btn-link" type="button" onClick={() => navigate("/login")} disabled={loading}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
export { RegisterPage };
