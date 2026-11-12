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

test("energy lines can be dragged vertically without changing the other level", async ({ page }) => {
  await page.goto("/?screens=2&ea");
  const middle = page.getByRole("slider", { name: "Middle level above ground (eV)", exact: true });
  const upper = page.getByRole("slider", { name: "Upper level above ground (eV)", exact: true });
  await expect(middle).toBeAttached();
  const oldMiddle = Number(await middle.getAttribute("aria-valuenow"));
  const oldUpper = await upper.getAttribute("aria-valuenow");
  const point = await page.evaluate((energy) => {
    // Use Scenery's actual transform; the design rectangle is scaled and letterboxed by Joist.
    const phet = (
      window as unknown as {
        phet: {
          joist: {
            sim: {
              selectedScreenProperty: {
                value: { view: { localToGlobalPoint: (p: object) => { x: number; y: number } } };
              };
            };
          };
          dot: Record<"Vector2", new (x: number, y: number) => object>;
        };
      }
    ).phet;
    const view = phet.joist.sim.selectedScreenProperty.value.view;
    return view.localToGlobalPoint(new phet.dot.Vector2(800, 12 + 224 - energy * 53));
  }, oldMiddle);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x, point.y - 20, { steps: 6 });
  await page.mouse.up();
  expect(Number(await middle.getAttribute("aria-valuenow"))).toBeGreaterThan(oldMiddle);
  expect(await upper.getAttribute("aria-valuenow")).toBe(oldUpper);
});
