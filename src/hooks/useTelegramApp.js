import { useEffect, useCallback, useState } from "react";

const EMPTY_TELEGRAM_CONTEXT = {
  tg: null,
  tgUser: null,
  initData: "",
  isInTelegram: false,
  themeParams: null,
};

function parseTelegramUser(webapp, initData) {
  if (webapp?.initDataUnsafe?.user) {
    return webapp.initDataUnsafe.user;
  }
  if (!initData) return null;
  try {
    const rawUser = new URLSearchParams(initData).get("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function readTelegramContext() {
  if (typeof window === "undefined") {
    return EMPTY_TELEGRAM_CONTEXT;
  }
  const webapp = window.Telegram?.WebApp ?? null;
  if (!webapp) {
    return EMPTY_TELEGRAM_CONTEXT;
  }
  const initData = webapp.initData ?? "";
  const tgUser = parseTelegramUser(webapp, initData);
  return {
    tg: webapp,
    tgUser,
    initData,
    // Only treat as "in Telegram" if initData is non-empty AND a user object is present.
    // Outside Telegram, telegram-web-app.js still defines WebApp with an empty initData string.
    isInTelegram: Boolean(initData && tgUser),
    themeParams: webapp.themeParams ?? null,
  };
}

/**
 * Hook for Telegram Mini App integration.
 * Reads window.Telegram.WebApp synchronously during initial state setup so route
 * gating sees isInTelegram on the first render without setState-in-effect cascades.
 */
export function useTelegramApp() {
  const [context] = useState(readTelegramContext);

  useEffect(() => {
    const webapp = context.tg;
    if (!webapp || !context.isInTelegram) return;

    webapp.ready?.();
    webapp.expand?.();

    // Sync Telegram theme params to CSS variables
    const p = context.themeParams;
    if (p) {
      const root = document.documentElement;
      if (p.bg_color) root.style.setProperty("--page-background", p.bg_color);
      if (p.secondary_bg_color) root.style.setProperty("--surface", p.secondary_bg_color);
      if (p.text_color) root.style.setProperty("--page-text", p.text_color);
      if (p.hint_color) root.style.setProperty("--muted", p.hint_color);
      if (p.button_color) root.style.setProperty("--primary", p.button_color);
    }
  }, [context]);

  const showMainButton = useCallback((text, onClick) => {
    const tg = context.tg;
    if (!tg?.MainButton) return;
    tg.MainButton.setText(text);
    tg.MainButton.onClick(onClick);
    tg.MainButton.show();
    return () => {
      tg.MainButton.offClick(onClick);
      tg.MainButton.hide();
    };
  }, [context.tg]);

  const closeApp = useCallback(() => {
    context.tg?.close?.();
  }, [context.tg]);

  return {
    ...context,
    showMainButton,
    closeApp,
  };
}
