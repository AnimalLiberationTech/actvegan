import { useEffect, useCallback, useRef } from "react";

/**
 * Hook for Telegram Mini App integration.
 * Reads window.Telegram.WebApp, signals ready, and exposes user/initData.
 * Values are read synchronously from the WebApp object via refs to avoid
 * setState-in-effect cascades.
 */
export function useTelegramApp() {
  const tgRef = useRef(null);
  const tgUserRef = useRef(null);
  const initDataRef = useRef("");
  const isInTelegramRef = useRef(false);
  const themeParamsRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const webapp = window.Telegram.WebApp;
      webapp.ready();
      webapp.expand();
      tgRef.current = webapp;
      tgUserRef.current = webapp.initDataUnsafe?.user ?? null;
      initDataRef.current = webapp.initData ?? "";
      isInTelegramRef.current = Boolean(webapp.initData);
      themeParamsRef.current = webapp.themeParams ?? null;

      // Sync Telegram theme params to CSS variables
      const p = webapp.themeParams;
      if (p) {
        const root = document.documentElement;
        if (p.bg_color) root.style.setProperty("--page-background", p.bg_color);
        if (p.secondary_bg_color) root.style.setProperty("--surface", p.secondary_bg_color);
        if (p.text_color) root.style.setProperty("--page-text", p.text_color);
        if (p.hint_color) root.style.setProperty("--muted", p.hint_color);
        if (p.button_color) root.style.setProperty("--primary", p.button_color);
      }
    }
  }, []);

  const showMainButton = useCallback((text, onClick) => {
    const tg = tgRef.current;
    if (!tg?.MainButton) return;
    tg.MainButton.setText(text);
    tg.MainButton.onClick(onClick);
    tg.MainButton.show();
    return () => {
      tg.MainButton.offClick(onClick);
      tg.MainButton.hide();
    };
  }, []);

  const closeApp = useCallback(() => {
    tgRef.current?.close();
  }, []);

  return {
    get tg() { return tgRef.current; },
    get tgUser() { return tgUserRef.current; },
    get initData() { return initDataRef.current; },
    get isInTelegram() { return isInTelegramRef.current; },
    get themeParams() { return themeParamsRef.current; },
    showMainButton,
    closeApp,
  };
}
