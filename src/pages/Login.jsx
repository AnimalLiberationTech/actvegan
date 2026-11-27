import { useState } from "react";
import API from "../services/api.js";
import BrandLogo from "../components/BrandLogo.jsx";

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const logApiResponse = (status, data) => {
    fetch("/__login-api-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, data }),
    }).catch((err) => {
      console.warn("Could not forward login API response to Vite:", err);
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await API.post(
        "/auth/login",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login API response:", response.data);
      logApiResponse(response.status, response.data);
      localStorage.setItem("token", response.data.token);
      onLogin(response.data);
    } catch (err) {
      const responseData = err.response?.data ?? err.message;
      console.error(
        "Login API error:",
        responseData
      );
      logApiResponse(err.response?.status ?? "network error", responseData);
      setError("Invalid username or password");
    }

    setLoading(false);
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-5">
      <div className="panel w-full max-w-[440px] p-6 sm:p-10">
        <div className="auth-brand">
          <BrandLogo size="lg" />
          <h1>Welcome back</h1>
          <p>Log in to manage your tasks</p>
        </div>

        {error && (
          <div className="notice notice-error">{error}</div>
        )}

        <form onSubmit={handleLogin} className="grid gap-4">
          <input
            type="email"
            required
            placeholder="Email"
            className="control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            required
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
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToRegister}
            className="btn-link"
          >
            Register
          </button>
        </p>

      </div>
    </div>
  );
}

export default Login;