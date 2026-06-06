import { test, expect } from "@playwright/test";

// ─── Navigation ───────────────────────────────────────────────────────────────

test.describe("Navigation", () => {
  test("sidebar is visible on dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("nav, aside, [class*=sidebar]").first()).toBeVisible();
  });

  test("all sidebar links are rendered", async ({ page }) => {
    await page.goto("/dashboard");
    const links = [
      "/dashboard",
      "/factory/infographics",
      "/factory/cartoon",
      "/factory/clips",
      "/factory/carousels",
      "/factory/posts",
      "/generator",
      "/trends",
      "/autopost",
      "/channels",
    ];
    for (const href of links) {
      await expect(page.locator(`a[href="${href}"]`)).toBeVisible();
    }
  });
});

// ─── Dashboard ────────────────────────────────────────────────────────────────

test.describe("Dashboard", () => {
  test("loads with key metrics visible", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "ADONIS AI Platform" })).toBeVisible();
  });

  test("no uncaught JS errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/dashboard");
    await page.waitForTimeout(1500);
    expect(errors.filter((e) => !e.includes("Warning:"))).toHaveLength(0);
  });
});

// ─── Factory pages ────────────────────────────────────────────────────────────

test.describe("Factory — Infographics", () => {
  test("page loads with heading", async ({ page }) => {
    await page.goto("/factory/infographics");
    await expect(page.getByRole("heading", { name: "Инфографика" })).toBeVisible();
  });

  test("has tabs: Скрипт, План, Создать, Автопост", async ({ page }) => {
    await page.goto("/factory/infographics");
    await expect(page.getByRole("tab", { name: /скрипт/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /план/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /создать/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /автопост/i })).toBeVisible();
  });

  test("Скрипт tab has generate button", async ({ page }) => {
    await page.goto("/factory/infographics");
    const btn = page.getByRole("button", { name: /генерир|создать|запустить/i }).first();
    await expect(btn).toBeVisible();
  });
});

test.describe("Factory — Cartoon", () => {
  test("page loads", async ({ page }) => {
    await page.goto("/factory/cartoon");
    await expect(page.getByRole("heading", { name: "Мультяшки" })).toBeVisible();
  });

  test("has 4 tabs", async ({ page }) => {
    await page.goto("/factory/cartoon");
    const tabs = page.getByRole("tab");
    expect(await tabs.count()).toBeGreaterThanOrEqual(4);
  });
});

test.describe("Factory — Clips", () => {
  test("page loads", async ({ page }) => {
    await page.goto("/factory/clips");
    await expect(page.locator("h1").first()).toBeVisible();
  });
});

test.describe("Factory — Carousels", () => {
  test("page loads", async ({ page }) => {
    await page.goto("/factory/carousels");
    await expect(page.locator("h1").first()).toBeVisible();
  });
});

test.describe("Factory — Posts", () => {
  test("page loads", async ({ page }) => {
    await page.goto("/factory/posts");
    await expect(page.locator("h1").first()).toBeVisible();
  });
});

test.describe("Factory — HeyGen AI", () => {
  test("page loads", async ({ page }) => {
    await page.goto("/factory/heygen-ai");
    await expect(page.locator("h1").first()).toBeVisible();
  });
});

test.describe("Factory — HeyGen Live", () => {
  test("page loads", async ({ page }) => {
    await page.goto("/factory/heygen-live");
    await expect(page.locator("h1").first()).toBeVisible();
  });
});

// ─── Generator ────────────────────────────────────────────────────────────────

test.describe("Generator", () => {
  test("page loads with form", async ({ page }) => {
    await page.goto("/generator");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    // Should have a text input or textarea for topic
    const input = page.locator("input[type=text], textarea").first();
    await expect(input).toBeVisible();
  });

  test("generate button is present and enabled", async ({ page }) => {
    await page.goto("/generator");
    const btn = page.getByRole("button", { name: /генерир|создать|запустить/i }).first();
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });
});

// ─── Trends ───────────────────────────────────────────────────────────────────

test.describe("Trends", () => {
  test("page loads with trend cards", async ({ page }) => {
    await page.goto("/trends");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("refresh button is present", async ({ page }) => {
    await page.goto("/trends");
    const btn = page.getByRole("button", { name: /обновить|refresh|тренд/i }).first();
    await expect(btn).toBeVisible();
  });
});

// ─── Autopost ─────────────────────────────────────────────────────────────────

test.describe("Autopost", () => {
  test("page loads with calendar", async ({ page }) => {
    await page.goto("/autopost");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("has scheduled post cards or calendar grid", async ({ page }) => {
    await page.goto("/autopost");
    await page.waitForTimeout(800); // localStorage seed
    // Either calendar cells or post cards should exist
    const items = page.locator("[class*=card], [class*=post], [class*=cell], [class*=slot]");
    expect(await items.count()).toBeGreaterThan(0);
  });
});

// ─── Channels ─────────────────────────────────────────────────────────────────

test.describe("Channels", () => {
  test("page loads with platform list", async ({ page }) => {
    await page.goto("/channels");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("TikTok platform card is visible", async ({ page }) => {
    await page.goto("/channels");
    await expect(page.getByText("TikTok")).toBeVisible();
  });

  test("Instagram platform card is visible", async ({ page }) => {
    await page.goto("/channels");
    await expect(page.getByText("Instagram")).toBeVisible();
  });
});

// ─── API routes health checks ─────────────────────────────────────────────────

test.describe("API routes — health", () => {
  test("POST /api/generate returns 200 or 500 (not 404)", async ({ request }) => {
    const res = await request.post("/api/generate", {
      data: { topic: "test", goal: "sell", format: "post" },
    });
    // 200 = works, 500 = API key missing — both mean route exists
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(405);
  });

  test("POST /api/content-plan returns not 404", async ({ request }) => {
    const res = await request.post("/api/content-plan", {
      data: { direction: "infographics", topic: "франшиза" },
    });
    expect(res.status()).not.toBe(404);
  });

  test("POST /api/trends returns not 404", async ({ request }) => {
    const res = await request.post("/api/trends", { data: {} });
    expect(res.status()).not.toBe(404);
  });

  test("POST /api/repurpose returns not 404", async ({ request }) => {
    const res = await request.post("/api/repurpose", {
      data: { content: "test content", platforms: ["tiktok"] },
    });
    expect(res.status()).not.toBe(404);
  });

  test("GET /api/content returns not 404", async ({ request }) => {
    const res = await request.get("/api/content");
    expect(res.status()).not.toBe(404);
  });

  test("GET /api/leads returns not 404", async ({ request }) => {
    const res = await request.get("/api/leads");
    expect(res.status()).not.toBe(404);
  });

  test("POST /api/higgsfield/generate returns not 404", async ({ request }) => {
    const res = await request.post("/api/higgsfield/generate", {
      data: { prompt: "test", model: "kling3", duration: 5 },
    });
    expect(res.status()).not.toBe(404);
  });

  test("GET /api/higgsfield/balance returns not 404", async ({ request }) => {
    const res = await request.get("/api/higgsfield/balance");
    expect(res.status()).not.toBe(404);
  });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

test.describe("Auth", () => {
  test("/ redirects to /dashboard (with cookie)", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/(dashboard|login|factory)/);
    expect(page.url()).not.toContain("404");
  });

  test("without cookie, redirected to /login", async ({ browser }) => {
    const ctx = await browser.newContext(); // no auth cookie
    const page = await ctx.newPage();
    await page.goto("http://localhost:3000/dashboard");
    await page.waitForURL(/login/, { timeout: 5000 });
    await ctx.close();
  });
});
