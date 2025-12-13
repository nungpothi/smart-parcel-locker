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
    <div style={{ padding: "16px" }}>
      <h1>Register Page</h1>
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
        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} disabled={loading}>
            <option value="ADMIN">ADMIN</option>
            <option value="COURIER">COURIER</option>
            <option value="RECIPIENT">RECIPIENT</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      {error ? <p style={{ color: "red" }}>{error}</p> : null}
    </div>
  );
};

export default RegisterPage;
export { RegisterPage };
