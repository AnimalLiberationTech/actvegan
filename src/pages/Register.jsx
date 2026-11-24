import { useState } from "react";
import axios from "axios";
import BrandLogo from "../components/BrandLogo.jsx";

function Register({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/auth/register`, {
        email,
        password,
        display_name: username,
      });

      onRegister(); // go back to login
    } catch (err) {
  if (err.response?.data?.detail) {
    setError(JSON.stringify(err.response.data.detail));
  } else {
    setError("Registration failed.");
  }
}

    setLoading(false);
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-5">
      <div className="panel w-full max-w-[440px] p-6 sm:p-10">
        <div className="auth-brand">
          <BrandLogo size="lg" />
          <h1>Create account</h1>
          <p>Start making progress with less friction</p>
        </div>

        {error && (
          <div className="notice notice-error">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="grid gap-4">
          <input
            type="text"
            placeholder="Username"
            className="control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Creating..." : "Register"}
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <button
          onClick={onSwitchToLogin}
            className="btn-link"
          >
            Login
          </button>
        </p>

      </div>
    </div>
  );
}

export default Register;