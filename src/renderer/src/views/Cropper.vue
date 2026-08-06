<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
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
const viewport = ref({
  width: window.innerWidth,
  height: window.innerHeight,
});

const viewBox = computed(() => {
  return `0 0 ${viewport.value.width} ${viewport.value.height}`;
});

const pathD = computed(() => {
  const { width, height } = viewport.value;

  return overlay.value
    ? `M0,0 v${height} h${width} v${-height} z M${overlay.value.x},${overlay.value.y} h${overlay.value.width} v${overlay.value.height} h${-overlay.value.width} z`
    : `M0,0 v${height} h${width} v${-height} z`;
});

const updateViewport = () => {
  viewport.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

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

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    window.ipc.send("exit");
  }
};

onMounted(() => {
  updateViewport();
  window.addEventListener("resize", updateViewport);
  window.addEventListener("keydown", onKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateViewport);
  window.removeEventListener("keydown", onKeyDown);
});
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
  cursor: crosshair;
}

.overlay {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
