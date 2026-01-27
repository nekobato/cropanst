<script lang="ts" setup>
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { log } from "electron-log";

const isFocused = ref(false);

const video = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D>();

const displaySizePhysical = ref({
  width: 0,
  height: 0,
});

const boundsPhysical = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

/**
 * Draw the selected physical-pixel region into the canvas.
 */
function drawImage() {
  if (video.value && canvas.value && ctx.value) {
    ctx.value.drawImage(
      video.value,
      boundsPhysical.value.x,
      boundsPhysical.value.y,
      boundsPhysical.value.width,
      boundsPhysical.value.height,
      0,
      0,
      canvas.value.width,
      canvas.value.height
    );
  }
}

/**
 * Request the main process to close the app.
 */
function closeWindow() {
  window.ipc.send("exit");
}

window.ipc.on("cropper:capture", (_, data) => {
  // Retina / HiDPI: use physical metrics for getDisplayMedia and drawImage cropping.
  displaySizePhysical.value = data.displaySizePhysical;
  boundsPhysical.value = data.boundsPhysical;
  navigator.mediaDevices
    .getDisplayMedia({
      audio: false,
      video: {
        width: displaySizePhysical.value.width,
        height: displaySizePhysical.value.height,
        frameRate: 30,
      },
    })
    .then((stream) => {
      if (video.value && canvas.value) {
        ctx.value = canvas.value.getContext("2d")!;
        video.value.srcObject = stream;
        video.value.onloadedmetadata = (e) => {
          video.value?.play();
          setInterval(() => drawImage(), 1000 / 30);
        };
      }
    })
    .catch((e) => log(e));
});

window.ipc.on("focus", () => {
  isFocused.value = true;
});

window.ipc.on("blur", () => {
  isFocused.value = false;
});
</script>
<template>
  <video
    ref="video"
    class="video"
    autoplay
    playsinline
    :width="displaySizePhysical.width"
    :height="displaySizePhysical.height"
  ></video>
  <canvas
    ref="canvas"
    class="canvas"
    :width="boundsPhysical.width"
    :height="boundsPhysical.height"
  ></canvas>
  <button
    @click="closeWindow"
    class="close-button"
    :class="{ 'is-focused': isFocused }"
  >
    <Icon class="icon" icon="mingcute:close-fill" />
  </button>
</template>

<style lang="scss" scoped>
.video {
  display: none;
}
.canvas {
  width: 100%;
  height: 100%;
  cursor: move;
  -webkit-app-region: drag;
}

.close-button {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  visibility: hidden;
  -webkit-app-region: no-drag;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.is-focused {
    visibility: visible;
  }
}
</style>
