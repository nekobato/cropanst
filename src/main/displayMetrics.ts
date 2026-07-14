/**
 * @file Display metrics used only to request a preferred desktop stream size.
 */

import { screen } from "electron";

/**
 * Get the preferred physical-pixel capture size of a display.
 *
 * The delivered getDisplayMedia frame may still differ from this preferred
 * size, so renderer cropping must use the video's intrinsic dimensions.
 */
export const getDisplaySizePhysical = (
  display: Electron.Display
): { width: number; height: number } => {
  if (process.platform === "win32") {
    const displayPhysicalGlobal = screen.dipToScreenRect(null, display.bounds);

    return {
      width: displayPhysicalGlobal.width,
      height: displayPhysicalGlobal.height,
    };
  }

  return {
    width: Math.round(display.bounds.width * display.scaleFactor),
    height: Math.round(display.bounds.height * display.scaleFactor),
  };
};
