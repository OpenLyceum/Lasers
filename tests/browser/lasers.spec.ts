import { expect, test } from "@playwright/test";

for (const screen of [1, 2]) {
  test(`screen ${screen} controls, keyboard, photo and responsive rendering`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/?screens=${screen}&ea`);
    const slider = page.getByRole("slider", { name: "Middle level above ground (eV)", exact: true });
    await expect(slider).toBeAttached({ timeout: 30000 });
    await slider.focus();
    const old = await slider.getAttribute("aria-valuenow");
    await page.keyboard.press("ArrowRight");
    expect(await slider.getAttribute("aria-valuenow")).not.toBe(old);
    const mirrors = page.getByRole("checkbox", { name: "Enable mirrors", exact: true });
    await mirrors.focus();
    await page.keyboard.press("Space");
    await expect(mirrors).toBeChecked();
    await page.getByRole("button", { name: "Actual laser photograph", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeAttached();
    await page.keyboard.press("Escape");
    await page.screenshot({ path: `test-results/screen-${screen}.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `test-results/screen-${screen}-narrow.png` });
    expect(errors).toEqual([]);
  });
}

test("projector profile and French locale render on the multiple-atoms screen", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?screens=2&colorProfile=projector&locale=fr&ea");
  await expect(page.getByRole("checkbox", { name: "Activer les miroirs", exact: true })).toBeAttached();
  await page.screenshot({ path: "test-results/projector-fr.png" });
  expect(errors).toEqual([]);
});
