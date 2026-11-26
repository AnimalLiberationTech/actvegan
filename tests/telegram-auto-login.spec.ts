import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { test, expect } from "@playwright/test";

const DIST_DIR = path.resolve(process.cwd(), "dist");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

function startDistServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const reqPath = (req.url || "/").split("?")[0];
      const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, "");
      let filePath = path.join(DIST_DIR, safePath === "/" ? "index.html" : safePath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, "index.html");
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

const SAMPLE_INIT_DATA =
  "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Vaska%22%2C%22username%22%3A%22vaskathevegan%22%7D&auth_date=1700000000&hash=deadbeef";

const SAMPLE_TG_USER = {
  id: 123456789,
  first_name: "Vaska",
  username: "vaskathevegan",
};

test.describe("Telegram Mini App auto-login", () => {
  let server;
  let baseUrl;

  test.beforeAll(async () => {
    ({ server, baseUrl } = await startDistServer());
  });

  test.afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  async function mockTelegramSdk(page, { initData = SAMPLE_INIT_DATA, user = SAMPLE_TG_USER } = {}) {
    await page.route("https://telegram.org/js/telegram-web-app.js", async (route) => {
      const body = `
        window.Telegram = {
          WebApp: {
            initData: ${JSON.stringify(initData)},
            initDataUnsafe: ${JSON.stringify(user ? { user } : {})},
            themeParams: {},
            ready: function () {},
            expand: function () {},
            close: function () {},
            MainButton: { setText: function () {}, onClick: function () {}, offClick: function () {}, show: function () {}, hide: function () {} }
          }
        };
      `;
      await route.fulfill({ status: 200, contentType: "application/javascript", body });
    });
  }

  test("automatically logs in / registers when opened inside Telegram", async ({ page }) => {
    let authPayload = null;
    await mockTelegramSdk(page);

    await page.route("**/auth/telegram", async (route) => {
      authPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "tg-jwt-token",
          user_id: "user-tg-1",
          email: "telegram:123456789@tg",
          user_type: "disabled",
        }),
      });
    });

    await page.route("**/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-tg-1",
          email: "telegram:123456789@tg",
          display_name: "Vaska",
          user_type: "disabled",
          created_at: "2026-11-26T00:00:00Z",
        }),
      });
    });

    await page.route("**/tasks/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto(`${baseUrl}/`);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Task Manager" })).toBeVisible();
    await expect(page.locator(".nav-user")).toContainText("Vaska");
    expect(authPayload).toEqual({ init_data: SAMPLE_INIT_DATA });
    const storedToken = await page.evaluate(() => localStorage.getItem("token"));
    expect(storedToken).toBe("tg-jwt-token");
  });

  test("redirects admin Telegram users to /admin after auto-login", async ({ page }) => {
    await mockTelegramSdk(page);

    await page.route("**/auth/telegram", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "tg-admin-jwt",
          user_id: "admin-tg-1",
          email: "telegram:123456789@tg",
          user_type: "admin",
        }),
      });
    });

    await page.route("**/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "admin-tg-1",
          email: "telegram:123456789@tg",
          display_name: "Admin Vaska",
          user_type: "admin",
          created_at: "2026-11-26T00:00:00Z",
        }),
      });
    });

    await page.route("**/tasks/", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await page.route("**/users/", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await page.goto(`${baseUrl}/`);

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Admin dashboard" })).toBeVisible();
  });

  test("re-authenticates automatically after a 401 expired token in Telegram", async ({ page }) => {
    let authCalls = 0;
    await mockTelegramSdk(page);

    await page.addInitScript(() => {
      if (!sessionStorage.getItem("_test_seeded")) {
        sessionStorage.setItem("_test_seeded", "1");
        localStorage.setItem("token", "expired-jwt");
        sessionStorage.setItem("tgAuthDone", "1");
      }
    });

    await page.route("**/auth/telegram", async (route) => {
      authCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "fresh-tg-jwt",
          user_id: "user-tg-1",
          email: "telegram:123456789@tg",
          user_type: "user",
        }),
      });
    });

    await page.route("**/users/me", async (route) => {
      const authHeader = route.request().headers()["authorization"];
      if (authHeader === "Bearer expired-jwt") {
        await route.fulfill({ status: 401, contentType: "application/json", body: '{"detail":"expired"}' });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-tg-1",
          email: "telegram:123456789@tg",
          display_name: "Vaska",
          user_type: "user",
          created_at: "2026-11-26T00:00:00Z",
        }),
      });
    });

    await page.route("**/tasks/", async (route) => {
      const authHeader = route.request().headers()["authorization"];
      if (authHeader === "Bearer expired-jwt") {
        await route.fulfill({ status: 401, contentType: "application/json", body: '{"detail":"expired"}' });
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await page.goto(`${baseUrl}/`);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Task Manager" })).toBeVisible();
    expect(authCalls).toBe(1);
    const storedToken = await page.evaluate(() => localStorage.getItem("token"));
    expect(storedToken).toBe("fresh-tg-jwt");
  });

  test("does not intercept regular browser visitors when initData is empty", async ({ page }) => {
    let authCalled = false;
    await mockTelegramSdk(page, { initData: "", user: null });

    await page.route("**/auth/telegram", async (route) => {
      authCalled = true;
      await route.abort();
    });

    await page.goto(`${baseUrl}/`);

    await expect(page).toHaveURL(`${baseUrl}/`);
    await expect(page.getByText("act vegan")).toBeVisible();
    expect(authCalled).toBe(false);
  });

  test("navigates to /login on manual logout inside Telegram without auto-login loop", async ({ page }) => {
    let authCalls = 0;
    await mockTelegramSdk(page);

    await page.route("**/auth/telegram", async (route) => {
      authCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "tg-jwt-token",
          user_id: "user-tg-1",
          email: "telegram:123456789@tg",
          user_type: "user",
        }),
      });
    });

    await page.route("**/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-tg-1",
          email: "telegram:123456789@tg",
          display_name: "Vaska",
          user_type: "user",
          created_at: "2026-11-26T00:00:00Z",
        }),
      });
    });

    await page.route("**/tasks/", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await page.goto(`${baseUrl}/`);
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    expect(authCalls).toBe(1);
  });
});
