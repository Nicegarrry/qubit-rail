import { test } from "@playwright/test";

for (const width of [390, 1280]) {
  test(`rail at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 820 });
    await page.goto("/");
    if (width < 1025) await page.getByRole("button", { name: "Open chat" }).click();
    await page.getByRole("button", { name: /Design notes/ }).click();
    await page.screenshot({ path: `docs/shots/rail-${width}.png`, fullPage: true });
  });
}
