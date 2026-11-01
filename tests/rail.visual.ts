import { test } from "@playwright/test";

for (const { width, open, shot } of [
  { width: 1280, open: false, shot: "desktop-closed.png" },
  { width: 1280, open: true, shot: "desktop-open.png" },
  { width: 390, open: true, shot: "phone-open.png" },
]) {
  test(shot, async ({ page }) => {
    await page.route("**/embed?agent=qos", route => route.fulfill({ contentType: "text/html", body: '<body style="font:16px system-ui;padding:24px;color:#111"><h2>QOS chat</h2><p>How can I help with this page?</p></body>' }));
    await page.setViewportSize({ width, height: 820 });
    await page.goto("/");
    if (open) await page.getByRole("button", { name: "Chat with QOS" }).click();
    if (open) await page.frameLocator('iframe[title="QOS chat"]').getByText("How can I help with this page?").waitFor();
    await page.screenshot({ path: `docs/shots/${shot}`, fullPage: true });
  });
}
