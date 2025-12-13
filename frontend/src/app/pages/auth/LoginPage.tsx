import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { Role } from "../../types/domain";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore((state) => ({ login: state.login }));

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await login(phone, password);
      const role = useAuthStore.getState().role as Role | null;
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "COURIER") {
        navigate("/courier/parcels/create");
      } else if (role === "RECIPIENT") {
        navigate("/pickup/request-otp");
      } else {
        navigate("/login");
      }
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
            {error ? (
              <div className="alert alert-danger py-2 mb-0" role="alert">
                {error}
              </div>
            ) : null}
            <button className="btn btn-warning w-100" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
          <div className="mt-3 text-center">
            <button className="btn btn-link" type="button" onClick={() => navigate("/register")} disabled={loading}>
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
export { LoginPage };
