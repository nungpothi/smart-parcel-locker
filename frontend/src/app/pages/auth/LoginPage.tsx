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
    <div style={{ padding: "16px" }}>
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: 320 }}>
        <label>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error ? <p style={{ color: "red" }}>{error}</p> : null}
    </div>
  );
};

export default LoginPage;
export { LoginPage };
