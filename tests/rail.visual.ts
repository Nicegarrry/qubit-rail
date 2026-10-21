import { test } from "@playwright/test";

for (const { width, shot } of [{ width: 390, shot: "rail-390.png" }, { width: 1280, shot: "rail-1280.png" }, { width: 1520, shot: "rail-380.png" }]) {
  test(`rail at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 820 });
    await page.goto("/");
    if (width < 1025) await page.getByRole("button", { name: "Open chat" }).click();
    await page.getByRole("button", { name: /Design notes/ }).click();
    await page.screenshot({ path: `docs/shots/${shot}`, fullPage: true });
  });
}
