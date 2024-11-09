<script lang="ts" setup>
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { log } from "electron-log";

const isFocused = ref(false);

const video = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D>();

const displaySize = ref({
  width: 0,
  height: 0,
});

const videoBounds = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

function drawImage() {
  if (video.value && canvas.value && ctx.value) {
    ctx.value.drawImage(
      video.value,
      videoBounds.value.x,
      videoBounds.value.y,
      videoBounds.value.width,
      videoBounds.value.height,
      0,
      0,
      canvas.value.width,
      canvas.value.height
    );
  }
}

function closeWindow() {
  window.ipc.send("exit");
}

window.ipc.on("cropper:capture", (_, data) => {
  displaySize.value = data.size;
  videoBounds.value = data.bounds;
  navigator.mediaDevices
    .getDisplayMedia({
      audio: false,
      video: {
        width: displaySize.value.width,
        height: displaySize.value.height,
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
    :width="displaySize.width"
    :height="displaySize.height"
  ></video>
  <canvas
    ref="canvas"
    class="canvas"
    :width="videoBounds.width"
    :height="videoBounds.height"
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
