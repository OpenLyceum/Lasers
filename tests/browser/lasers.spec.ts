import { expect, test } from "@playwright/test";
import type { Color, Node } from "scenerystack/scenery";

type BrowserSim = {
  selectedScreenProperty: { value: { view: Node; backgroundColorProperty: { value: Color } } };
  preferencesModel: { visualModel: { colorProfileProperty: { value: string } } };
};

declare global {
  interface Window {
    phet: { joist: { sim: BrowserSim } };
  }
}

for (const screen of [1, 2]) {
  test(`screen ${screen} uses SVG and switches its full palette while paused`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/?screens=${screen}&ea`);
    const mirrors = page.getByRole("checkbox", { name: "Enable mirrors", exact: true });
    await expect(mirrors).toBeAttached();
    await mirrors.focus();
    await page.keyboard.press("Space");
    // Exercise emitted photons as well as the initial apparatus.
    if (screen === 2) {
      const pump = page.getByRole("slider", { name: "Pump rate (photons/s)", exact: true });
      await pump.focus();
      await page.keyboard.press("End");
    }
    const pause = page.getByRole("button", { name: "Pause", exact: true });
    await pause.focus();
    await page.keyboard.press("Enter");

    for (const profile of ["default", "projector", "default"]) {
      await page.evaluate((name) => {
        window.phet.joist.sim.preferencesModel.visualModel.colorProfileProperty.value = name;
      }, profile);
      const background = profile === "default" ? "rgb(0,0,0)" : "rgb(255,255,255)";
      await expect
        .poll(() =>
          page.evaluate(() => window.phet.joist.sim.selectedScreenProperty.value.backgroundColorProperty.value.toCSS()),
        )
        .toBe(background);
      // Check the actual SVG gradient, which must update even with physics paused.
      const cavityCenter = page.locator('svg linearGradient stop[offset="0.5"]').first();
      await expect(cavityCenter).toHaveCSS("stop-color", profile === "default" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)");
      expect(await page.locator("canvas").count()).toBe(0);
      const rasterNodes = await page.evaluate(() => {
        const names: string[] = [];
        const visit = (node: Node) => {
          if (/Image|CanvasNode/.test(node.constructor.name)) {
            names.push(node.constructor.name);
          }
          node.children.forEach(visit);
        };
        visit(window.phet.joist.sim.selectedScreenProperty.value.view);
        return names;
      });
      expect(rasterNodes).toEqual([]);
      await page.screenshot({ path: `test-results/screen-${screen}-${profile}-svg.png` });
    }
    expect(errors).toEqual([]);
  });

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

for (const profile of ["default", "projector"]) {
  test(`lifetimes broaden only their own level and energy labels stay separate in ${profile}`, async ({ page }) => {
    await page.goto(`/?screens=2&colorProfile=${profile}&ea`);
    const lifetime = page.getByRole("slider", { name: "Middle lifetime (model ms)", exact: true });
    await expect(lifetime).toBeAttached();
    const energy = page.getByRole("slider", { name: "Middle level above ground (eV)", exact: true });
    const originalEnergy = await energy.getAttribute("aria-valuenow");
    const pause = page.getByRole("button", { name: "Pause", exact: true });
    await pause.focus();
    await page.keyboard.press("Enter");
    const readBands = () =>
      page.locator("svg linearGradient").evaluateAll((gradients) =>
        gradients
          .filter((gradient) => gradient.children.length === 33)
          // Replacing a gradient can reorder SVG definitions. Match levels by their stable center color.
          .sort((a, b) =>
            (a.children[16] as SVGStopElement).style.stopColor.localeCompare(
              (b.children[16] as SVGStopElement).style.stopColor,
            ),
          )
          .map((gradient) =>
            [...gradient.children].reduce((sum, stop) => sum + Number((stop as SVGStopElement).style.stopOpacity), 0),
          ),
      );
    const before = await readBands();
    expect(before).toHaveLength(2);
    // The middle level starts at the longest lifetime, so it has the narrowest line.
    const middleIndex = before.indexOf(Math.min(...before));
    await lifetime.focus();
    await page.keyboard.press("Home");
    await expect(lifetime).toHaveAttribute("aria-valuenow", "1");
    await expect.poll(async () => (await readBands())[middleIndex]).toBeGreaterThan((before[middleIndex] ?? 0) * 3);
    expect((await readBands())[1 - middleIndex]).toBe(before[1 - middleIndex]);
    await expect(energy).toHaveAttribute("aria-valuenow", originalEnergy ?? "");
    const energyLabels = page.locator("svg text").filter({ hasText: /^[\d.]+\s+eV$/ });
    const lifetimeLabels = page.locator("svg text").filter({ hasText: /^Lifetime$/ });
    await expect(energyLabels).toHaveCount(2);
    await expect(lifetimeLabels).toHaveCount(2);
    const energyBounds = await energyLabels.first().boundingBox();
    const lifetimeBounds = await lifetimeLabels.first().boundingBox();
    expect(energyBounds).not.toBeNull();
    expect(lifetimeBounds).not.toBeNull();
    expect((energyBounds?.x ?? 0) + (energyBounds?.width ?? 0)).toBeLessThan(lifetimeBounds?.x ?? 0);
    await page.screenshot({ path: `test-results/lifetime-broadening-${profile}.png` });
    await page.keyboard.press("End");
    await expect.poll(readBands).toEqual(before);
  });
}
