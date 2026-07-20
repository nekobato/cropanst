<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

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
const svgStyle = computed(() => {
  return {
    width: `${window.innerWidth}px`,
    height: `${window.innerHeight}px`,
  };
});

const viewBox = computed(() => {
  // fill display area
  return `0 0 ${window.innerWidth} ${window.innerHeight}`;
});

const pathD = computed(() => {
  return overlay.value
    ? `M0,0 v${window.innerHeight} h${window.innerWidth} v${-window.innerHeight} z M${overlay.value.x},${overlay.value.y} h${overlay.value.width} v${overlay.value.height} h${-overlay.value.width} z`
    : `M0,0 v${window.innerHeight} h${window.innerWidth} v${-window.innerHeight} z`;
});

const onMouseDown = (event: MouseEvent) => {
  overlay.value = {
    x: event.clientX,
    y: event.clientY,
    width: 0,
    height: 0,
  };
};

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

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    window.ipc.send("exit");
  }
});
</script>

<template>
  <div
    class="cropper"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  >
    <svg
      :style="svgStyle"
      :view-box="viewBox"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill="rgba(0, 0, 0, 0.5)" :d="pathD" fill-rule="evenodd"></path>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.cropper {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
</style>
