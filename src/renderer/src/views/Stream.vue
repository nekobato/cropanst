<script lang="ts" setup>
import { ref, onUnmounted } from "vue";
import { Icon } from "@iconify/vue";
import { log } from "electron-log";

const isFocused = ref(false);
const animationFrameId = ref<number | null>(null);

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

const scale = ref(1);

function drawImage() {
  if (video.value && canvas.value && ctx.value) {
    // Retinaディスプレイ対応のため、canvasのコンテキストを高解像度で描画
    ctx.value.drawImage(
      video.value,
      videoBounds.value.x * scale.value,
      videoBounds.value.y * scale.value,
      videoBounds.value.width * scale.value,
      videoBounds.value.height * scale.value,
      0,
      0,
      canvas.value.width,
      canvas.value.height
    );
  }
}

function animate() {
  drawImage();
  animationFrameId.value = requestAnimationFrame(animate);
}

function stopAnimation() {
  if (animationFrameId.value !== null) {
    cancelAnimationFrame(animationFrameId.value);
    animationFrameId.value = null;
  }
}

onUnmounted(() => {
  stopAnimation();
});

function closeWindow() {
  window.ipc.send("exit");
}

window.ipc.on("cropper:capture", (_, data: CreateStreamWindowData) => {
  displaySize.value = data.size;
  videoBounds.value = data.bounds;
  scale.value = data.scale;

  // 高解像度キャプチャのためのオプションを設定
  navigator.mediaDevices
    .getDisplayMedia({
      audio: false,
      video: {
        width: displaySize.value.width * data.scale,
        height: displaySize.value.height * data.scale,
        frameRate: 30,
      },
    })
    .then((stream) => {
      if (video.value && canvas.value) {
        // 高解像度レンダリングのための設定
        ctx.value = canvas.value.getContext("2d", { alpha: false })!;

        // Retinaディスプレイの場合、コンテキストの画質を向上
        if (scale.value > 1) {
          ctx.value.imageSmoothingEnabled = false; // ピクセル補間を無効化して鮮明に
        }

        video.value.srcObject = stream;
        video.value.onloadedmetadata = (e) => {
          video.value?.play();
          animate();
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
    :width="videoBounds.width * scale"
    :height="videoBounds.height * scale"
    :style="{
      width: videoBounds.width + 'px',
      height: videoBounds.height + 'px',
    }"
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
  cursor: move;
  -webkit-app-region: drag;
  /* width/heightはstyle属性で設定するため、ここでは削除 */
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
