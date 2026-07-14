/**
 * @file Regression tests for mapping DIP selections into capture-frame pixels.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapDipRectToFrame } from "./captureGeometry.ts";

describe("mapDipRectToFrame", () => {
  it("maps a Windows 125% DIP selection to physical frame pixels", () => {
    const result = mapDipRectToFrame(
      { x: 80, y: 40, width: 800, height: 600 },
      { width: 3072, height: 1728 },
      { width: 3840, height: 2160 }
    );

    assert.deepEqual(result, {
      x: 100,
      y: 50,
      width: 1000,
      height: 750,
    });
  });

  it("keeps coordinates unchanged on a 100% display", () => {
    const result = mapDipRectToFrame(
      { x: 100, y: 200, width: 640, height: 480 },
      { width: 1080, height: 1920 },
      { width: 1080, height: 1920 }
    );

    assert.deepEqual(result, {
      x: 100,
      y: 200,
      width: 640,
      height: 480,
    });
  });

  it("maps a macOS scaled display from DIP to its actual capture frame", () => {
    const result = mapDipRectToFrame(
      { x: 256, y: 144, width: 1024, height: 576 },
      { width: 2560, height: 1440 },
      { width: 3840, height: 2160 }
    );

    assert.deepEqual(result, {
      x: 384,
      y: 216,
      width: 1536,
      height: 864,
    });
  });

  it("uses the actual downscaled frame dimensions", () => {
    const result = mapDipRectToFrame(
      { x: 80, y: 40, width: 800, height: 600 },
      { width: 3072, height: 1728 },
      { width: 1920, height: 1080 }
    );

    assert.deepEqual(result, {
      x: 50,
      y: 25,
      width: 500,
      height: 375,
    });
  });

  it("rounds shared edges without gaps or overlaps", () => {
    const displaySize = { width: 4, height: 4 };
    const frameSize = { width: 5, height: 5 };
    const first = mapDipRectToFrame(
      { x: 0, y: 0, width: 1, height: 1 },
      displaySize,
      frameSize
    );
    const second = mapDipRectToFrame(
      { x: 1, y: 0, width: 1, height: 1 },
      displaySize,
      frameSize
    );
    const whole = mapDipRectToFrame(
      { x: 0, y: 0, width: 2, height: 1 },
      displaySize,
      frameSize
    );

    assert.deepEqual(
      [
        first.x + first.width,
        second.x,
        second.x + second.width,
        whole.x + whole.width,
      ],
      [1, 1, 3, 3]
    );
  });

  it("keeps a positive DIP selection at least one frame pixel wide", () => {
    const result = mapDipRectToFrame(
      { x: 1, y: 1, width: 1, height: 1 },
      { width: 3072, height: 1728 },
      { width: 1920, height: 1080 }
    );

    assert.deepEqual(result, {
      x: 1,
      y: 1,
      width: 1,
      height: 1,
    });
  });

  it("expands a tiny bottom-right selection toward the frame start", () => {
    const result = mapDipRectToFrame(
      { x: 99, y: 99, width: 1, height: 1 },
      { width: 100, height: 100 },
      { width: 1, height: 1 }
    );

    assert.deepEqual(result, {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });
  });

  it("clamps a selection to the actual frame bounds", () => {
    const result = mapDipRectToFrame(
      { x: 3000, y: 1700, width: 200, height: 100 },
      { width: 3072, height: 1728 },
      { width: 3840, height: 2160 }
    );

    assert.deepEqual(result, {
      x: 3750,
      y: 2125,
      width: 90,
      height: 35,
    });
  });

  it("rejects a non-positive display size", () => {
    assert.throws(
      () =>
        mapDipRectToFrame(
          { x: 0, y: 0, width: 100, height: 100 },
          { width: 0, height: 100 },
          { width: 100, height: 100 }
        ),
      RangeError
    );
  });

  it("rejects a non-positive capture-frame size", () => {
    assert.throws(
      () =>
        mapDipRectToFrame(
          { x: 0, y: 0, width: 100, height: 100 },
          { width: 100, height: 100 },
          { width: 100, height: 0 }
        ),
      RangeError
    );
  });

  it("rejects a rectangle with negative dimensions", () => {
    assert.throws(
      () =>
        mapDipRectToFrame(
          { x: 0, y: 0, width: -1, height: 100 },
          { width: 100, height: 100 },
          { width: 100, height: 100 }
        ),
      RangeError
    );
  });

  it("rejects a rectangle with zero area", () => {
    assert.throws(
      () =>
        mapDipRectToFrame(
          { x: 0, y: 0, width: 0, height: 100 },
          { width: 100, height: 100 },
          { width: 100, height: 100 }
        ),
      RangeError
    );
  });

  it("rejects a rectangle outside the display bounds", () => {
    assert.throws(
      () =>
        mapDipRectToFrame(
          { x: 101, y: 0, width: 1, height: 1 },
          { width: 100, height: 100 },
          { width: 100, height: 100 }
        ),
      RangeError
    );
  });
});
