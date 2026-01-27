import { screen } from "electron";

type Rect = Electron.Rectangle;
type Point = Pick<Electron.Rectangle, "x" | "y">;

/**
 * Coordinate conversion utilities for HiDPI / Retina displays.
 *
 * The crop selection is produced in DIP, while desktop capture and canvas
 * cropping operate in physical pixels. These helpers bridge the gap.
 */

/**
 * Round rectangle coordinates and size to integer pixels.
 */
const roundRect = (rect: Rect): Rect => ({
  x: Math.round(rect.x),
  y: Math.round(rect.y),
  width: Math.round(rect.width),
  height: Math.round(rect.height),
});

/**
 * Scale a rectangle by a scale factor.
 */
const scaleRect = (rect: Rect, scaleFactor: number): Rect => ({
  x: rect.x * scaleFactor,
  y: rect.y * scaleFactor,
  width: rect.width * scaleFactor,
  height: rect.height * scaleFactor,
});

/**
 * Subtract an origin point from a rectangle position.
 */
const subtractOrigin = (rect: Rect, origin: Point): Rect => ({
  x: rect.x - origin.x,
  y: rect.y - origin.y,
  width: rect.width,
  height: rect.height,
});

/**
 * Convert a global DIP rectangle into a global physical-pixel rectangle.
 *
 * On Windows, Electron provides a dedicated converter. On other platforms,
 * we fall back to scaleFactor-based conversion.
 */
export const toPhysicalScreenRect = (
  rectDip: Rect,
  display: Electron.Display
): Rect => {
  if (process.platform === "win32") {
    return roundRect(screen.dipToScreenRect(null, rectDip));
  }

  return roundRect(scaleRect(rectDip, display.scaleFactor));
};

/**
 * Convert a local DIP rectangle (relative to a display) into a local
 * physical-pixel rectangle for that same display.
 *
 * This is the key step for Retina correctness: we convert in global space
 * first, then translate back into display-local physical coordinates.
 */
export const toPhysicalLocalRect = (
  rectDipLocal: Rect,
  display: Electron.Display
): Rect => {
  const rectDipGlobal: Rect = {
    x: rectDipLocal.x + display.bounds.x,
    y: rectDipLocal.y + display.bounds.y,
    width: rectDipLocal.width,
    height: rectDipLocal.height,
  };

  const rectPhysicalGlobal = toPhysicalScreenRect(rectDipGlobal, display);
  const displayPhysicalGlobal = toPhysicalScreenRect(display.bounds, display);

  return roundRect(
    subtractOrigin(rectPhysicalGlobal, {
      x: displayPhysicalGlobal.x,
      y: displayPhysicalGlobal.y,
    })
  );
};

/**
 * Get the physical-pixel size of a display.
 */
export const getDisplaySizePhysical = (
  display: Electron.Display
): { width: number; height: number } => {
  const displayPhysicalGlobal = toPhysicalScreenRect(display.bounds, display);
  return {
    width: displayPhysicalGlobal.width,
    height: displayPhysicalGlobal.height,
  };
};
