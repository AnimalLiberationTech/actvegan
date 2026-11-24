import { useEffect, useState } from "react";
import { useTelegramApp } from "../hooks/useTelegramApp.js";
import { taskAPI } from "../services/api.js";
import BrandLogo from "./BrandLogo.jsx";

/**
 * Handles automatic Telegram authentication when the app is opened inside Telegram.
 * Calls POST /auth/telegram with the signed Telegram user data.
 * On success calls onLogin(data). Falls back to normal login if not in Telegram.
 */
function TelegramLogin({ onLogin, onFallback }) {
  const { isInTelegram, tgUser, initData } = useTelegramApp();
  const [status, setStatus] = useState("idle"); // idle | authenticating | success | error
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isInTelegram || !tgUser) return;

    // Parse initData query params to extract hash and auth_date
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    const auth_date = parseInt(params.get("auth_date"), 10);
    const userStr = params.get("user");

    if (!hash || !auth_date) {
      onFallback?.();
      return;
    }

    let user = tgUser;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {
        // keep tgUser as fallback
      }
    }

    const payload = {
      id: user.id,
      first_name: user.first_name ?? "",
      ...(user.last_name !== undefined ? { last_name: user.last_name } : {}),
      ...(user.username !== undefined ? { username: user.username } : {}),
      ...(user.photo_url !== undefined ? { photo_url: user.photo_url } : {}),
      auth_date,
      hash,
    };

    setStatus("authenticating");
    taskAPI.telegramAuth(payload).then((result) => {
      if (result.success) {
        localStorage.setItem("token", result.data.token);
        setStatus("success");
        onLogin(result.data);
      } else {
        setStatus("error");
        setError(result.error || "Telegram authentication failed");
        setTimeout(() => onFallback?.(), 2000);
      }
    });
    // onLogin / onFallback are stable refs passed from App — intentionally omitted from deps
    // to avoid re-triggering auth when parent re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInTelegram, tgUser, initData]);

  if (!isInTelegram) return null;

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="panel w-full max-w-[440px] p-6 sm:p-10 text-center">
        <div className="auth-brand">
          <BrandLogo size="lg" />
          <h1>act vegan</h1>
        </div>
        {status === "idle" && (
          <p className="text-[var(--muted)]">Connecting to Telegram…</p>
        )}
        {status === "authenticating" && (
          <div>
            <p className="loading-state text-[var(--muted)]">
              Signing you in with Telegram…
            </p>
            {tgUser && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Welcome, {tgUser.first_name}
                {tgUser.username ? ` (@${tgUser.username})` : ""}!
              </p>
            )}
          </div>
        )}
        {status === "success" && (
          <p className="text-[var(--primary)] font-semibold">✓ Signed in!</p>
        )}
        {status === "error" && (
          <div>
            <p className="text-[var(--danger)]">{error}</p>
            <p className="text-sm text-[var(--muted)] mt-1">Redirecting to login…</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TelegramLogin;
