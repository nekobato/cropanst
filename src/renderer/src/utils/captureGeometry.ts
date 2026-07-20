/**
 * @file Pure geometry utilities for mapping display DIP selections to capture frames.
 */

/**
 * A rectangular region in a two-dimensional coordinate space.
 */
export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * A two-dimensional size.
 */
export type Size = {
  width: number;
  height: number;
};

/**
 * Clamp a number to an inclusive range.
 */
const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(Math.max(value, minimum), maximum);

/**
 * Assert that a size can be used as a coordinate-space denominator or target.
 */
const assertPositiveSize = (size: Size, name: string): void => {
  if (
    !Number.isFinite(size.width) ||
    !Number.isFinite(size.height) ||
    size.width <= 0 ||
    size.height <= 0
  ) {
    throw new RangeError(`${name} must have finite, positive dimensions`);
  }
};

/**
 * Assert that a rectangle is finite and has positive dimensions.
 */
const assertValidRect = (rect: Rect): void => {
  if (
    !Number.isFinite(rect.x) ||
    !Number.isFinite(rect.y) ||
    !Number.isFinite(rect.width) ||
    !Number.isFinite(rect.height) ||
    rect.width <= 0 ||
    rect.height <= 0
  ) {
    throw new RangeError(
      "rect must have finite coordinates and positive dimensions"
    );
  }
};

/**
 * Map one edge from a DIP axis into the corresponding capture-frame axis.
 */
const mapEdge = (
  edgeDip: number,
  displayLengthDip: number,
  frameLength: number
): number => Math.round((edgeDip / displayLengthDip) * frameLength);

/**
 * Preserve a positive source span when both mapped edges round to one pixel.
 */
const ensurePositiveMappedSpan = (
  mappedStart: number,
  mappedEnd: number,
  sourceStart: number,
  sourceEnd: number,
  sourceLength: number,
  targetLength: number
): { start: number; end: number } => {
  const intersectionStart = clamp(sourceStart, 0, sourceLength);
  const intersectionEnd = clamp(sourceEnd, 0, sourceLength);

  if (mappedEnd > mappedStart || intersectionEnd <= intersectionStart) {
    return { start: mappedStart, end: mappedEnd };
  }

  if (mappedEnd < targetLength) {
    return { start: mappedStart, end: mappedEnd + 1 };
  }

  return { start: Math.max(0, mappedStart - 1), end: mappedEnd };
};

/**
 * Map a display-local DIP rectangle into the actual capture-frame pixels.
 *
 * Each edge is mapped independently before width and height are derived. This
 * keeps adjacent rectangles aligned under fractional scale factors and avoids
 * assuming that requested getDisplayMedia constraints equal the delivered
 * video frame dimensions.
 */
export const mapDipRectToFrame = (
  rectDipLocal: Rect,
  displaySizeDip: Size,
  frameSize: Size
): Rect => {
  assertValidRect(rectDipLocal);
  assertPositiveSize(displaySizeDip, "displaySizeDip");
  assertPositiveSize(frameSize, "frameSize");

  const left = clamp(
    mapEdge(rectDipLocal.x, displaySizeDip.width, frameSize.width),
    0,
    frameSize.width
  );
  const top = clamp(
    mapEdge(rectDipLocal.y, displaySizeDip.height, frameSize.height),
    0,
    frameSize.height
  );
  const right = clamp(
    mapEdge(
      rectDipLocal.x + rectDipLocal.width,
      displaySizeDip.width,
      frameSize.width
    ),
    left,
    frameSize.width
  );
  const bottom = clamp(
    mapEdge(
      rectDipLocal.y + rectDipLocal.height,
      displaySizeDip.height,
      frameSize.height
    ),
    top,
    frameSize.height
  );

  const horizontal = ensurePositiveMappedSpan(
    left,
    right,
    rectDipLocal.x,
    rectDipLocal.x + rectDipLocal.width,
    displaySizeDip.width,
    frameSize.width
  );
  const vertical = ensurePositiveMappedSpan(
    top,
    bottom,
    rectDipLocal.y,
    rectDipLocal.y + rectDipLocal.height,
    displaySizeDip.height,
    frameSize.height
  );

  if (horizontal.end <= horizontal.start || vertical.end <= vertical.start) {
    throw new RangeError("rect must overlap the display bounds");
  }

  return {
    x: horizontal.start,
    y: vertical.start,
    width: horizontal.end - horizontal.start,
    height: vertical.end - vertical.start,
  };
};
