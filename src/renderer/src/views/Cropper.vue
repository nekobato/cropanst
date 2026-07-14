<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";

type ViewportSize = {
  width: number;
  height: number;
};

const route = useRoute();

const overlay = ref(
  <
    {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null
  >null
);

/**
 * Read the current renderer viewport dimensions in display-independent pixels.
 */
const readViewportSize = (): ViewportSize => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const viewportSize = ref(readViewportSize());

/**
 * Build an SVG coordinate system that matches the current viewport.
 */
const viewBox = computed(() => {
  const { width, height } = viewportSize.value;
  return `0 0 ${width} ${height}`;
});

/**
 * Build the even-odd path for the dimmed viewport and optional selection.
 */
const pathD = computed(() => {
  const { width, height } = viewportSize.value;

  return overlay.value
    ? `M0,0 v${height} h${width} v${-height} z M${overlay.value.x},${overlay.value.y} h${overlay.value.width} v${overlay.value.height} h${-overlay.value.width} z`
    : `M0,0 v${height} h${width} v${-height} z`;
});

/**
 * Start a display-local crop selection.
 */
const onMouseDown = (event: MouseEvent) => {
  overlay.value = {
    x: event.clientX,
    y: event.clientY,
    width: 0,
    height: 0,
  };
};

/**
 * Resize the active crop selection to the current pointer position.
 */
const onMouseMove = (event: MouseEvent) => {
  if (overlay.value) {
    overlay.value.width = event.clientX - overlay.value.x;
    overlay.value.height = event.clientY - overlay.value.y;
  }
};

/**
 * Complete a positive-area selection and send its display-local DIP bounds.
 */
const onMouseUp = () => {
  const selection = overlay.value;
  if (!selection) {
    return;
  }

  const bounds = {
    x: selection.width > 0 ? selection.x : selection.x + selection.width,
    y: selection.height > 0 ? selection.y : selection.y + selection.height,
    width: Math.abs(selection.width),
    height: Math.abs(selection.height),
  };

  overlay.value = null;
  if (bounds.width < 1 || bounds.height < 1) {
    return;
  }

  window.ipc.send("cropper:capture", {
    displayId: route.params.displayId,
    bounds: bounds,
  });
};

/**
 * Quit the application when the user presses Escape.
 */
const onKeyDown = (event: KeyboardEvent): void => {
  if (event.key === "Escape") {
    window.ipc.send("exit");
  }
};

/**
 * Synchronize reactive dimensions with the renderer viewport.
 */
const syncViewportSize = (): void => {
  viewportSize.value = readViewportSize();
};

/**
 * Register window-scoped listeners for this cropper view.
 */
const setupWindowListeners = (): void => {
  syncViewportSize();
  window.addEventListener("resize", syncViewportSize);
  window.addEventListener("keydown", onKeyDown);
};

/**
 * Remove window-scoped listeners when this cropper view is unmounted.
 */
const teardownWindowListeners = (): void => {
  window.removeEventListener("resize", syncViewportSize);
  window.removeEventListener("keydown", onKeyDown);
};

onMounted(setupWindowListeners);
onUnmounted(teardownWindowListeners);
</script>

<template>
  <div
    class="cropper"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  >
    <svg class="overlay" :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg">
      <path fill="rgba(0, 0, 0, 0.5)" :d="pathD" fill-rule="evenodd"></path>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.cropper {
  position: fixed;
  inset: 0;
  overflow: hidden;
  cursor: crosshair;
}

.overlay {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
