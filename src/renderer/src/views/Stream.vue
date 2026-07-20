<script lang="ts" setup>
/**
 * @file Live preview for a display-local selection captured from the desktop.
 */

import { onUnmounted, ref, useTemplateRef } from "vue";
import { Icon } from "@iconify/vue";
import { log } from "electron-log";
import {
  mapDipRectToFrame,
  type Rect,
  type Size,
} from "@/utils/captureGeometry";

type CaptureWindowData = {
  displayId: number;
  boundsDip: Rect;
  displaySizeDip: Size;
  displaySizePhysical: Size;
};

const isFocused = ref(false);

const video = useTemplateRef<HTMLVideoElement>("video");
const canvas = useTemplateRef<HTMLCanvasElement>("canvas");

let context: CanvasRenderingContext2D | null = null;
let boundsFrame: Rect | null = null;
let animationFrameId: number | null = null;
let captureStream: MediaStream | null = null;
let captureRequestId = 0;

/**
 * Wait until a video element exposes its intrinsic frame dimensions.
 */
const waitForLoadedMetadata = (
  videoElement: HTMLVideoElement
): Promise<void> => {
  if (videoElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    /** Resolve the pending metadata wait. */
    const handleLoadedMetadata = (): void => {
      videoElement.removeEventListener("error", handleError);
      resolve();
    };

    /** Reject the pending metadata wait with the media error. */
    const handleError = (): void => {
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      reject(
        videoElement.error ?? new Error("Failed to load capture metadata")
      );
    };

    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata, {
      once: true,
    });
    videoElement.addEventListener("error", handleError, { once: true });
  });
};

/**
 * Draw the selected capture-frame region into the canvas.
 */
const drawImage = (): void => {
  if (!video.value || !canvas.value || !context || !boundsFrame) {
    return;
  }

  context.drawImage(
    video.value,
    boundsFrame.x,
    boundsFrame.y,
    boundsFrame.width,
    boundsFrame.height,
    0,
    0,
    canvas.value.width,
    canvas.value.height
  );
};

/**
 * Draw continuously while the preview window is active.
 */
const renderFrame = (): void => {
  drawImage();
  animationFrameId = window.requestAnimationFrame(renderFrame);
};

/**
 * Stop the active canvas rendering loop.
 */
const stopRendering = (): void => {
  if (animationFrameId === null) {
    return;
  }

  window.cancelAnimationFrame(animationFrameId);
  animationFrameId = null;
};

/**
 * Stop the current media stream and clear renderer-owned capture state.
 */
const stopCapture = (): void => {
  stopRendering();
  captureStream?.getTracks().forEach((track) => track.stop());
  captureStream = null;
  context = null;
  boundsFrame = null;

  if (video.value) {
    video.value.pause();
    video.value.srcObject = null;
  }
};

/**
 * Request a desktop stream and map the DIP selection to its actual frame size.
 */
const startCapture = async (data: CaptureWindowData): Promise<void> => {
  const requestId = ++captureRequestId;
  stopCapture();

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: {
        width: data.displaySizePhysical.width,
        height: data.displaySizePhysical.height,
        frameRate: 30,
      },
    });

    if (requestId !== captureRequestId) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    const videoElement = video.value;
    const canvasElement = canvas.value;
    if (!videoElement || !canvasElement) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error("Capture elements are unavailable");
    }

    captureStream = stream;
    videoElement.srcObject = stream;
    await waitForLoadedMetadata(videoElement);

    if (requestId !== captureRequestId) {
      return;
    }

    boundsFrame = mapDipRectToFrame(data.boundsDip, data.displaySizeDip, {
      width: videoElement.videoWidth,
      height: videoElement.videoHeight,
    });
    canvasElement.width = boundsFrame.width;
    canvasElement.height = boundsFrame.height;
    context = canvasElement.getContext("2d");
    if (!context) {
      throw new Error("Canvas 2D context is unavailable");
    }

    await videoElement.play();
    if (requestId === captureRequestId) {
      renderFrame();
    }
  } catch (error) {
    if (requestId === captureRequestId) {
      stopCapture();
    }
    throw error;
  }
};

/**
 * Invalidate pending capture requests and release all media resources.
 */
const disposeCapture = (): void => {
  captureRequestId += 1;
  stopCapture();
};

/**
 * Request the main process to close the app.
 */
const closeWindow = (): void => {
  disposeCapture();
  window.ipc.send("exit");
};

window.ipc.on("cropper:capture", (_, data: CaptureWindowData) => {
  void startCapture(data).catch((error) => log(error));
});

window.ipc.on("focus", () => {
  isFocused.value = true;
});

window.ipc.on("blur", () => {
  isFocused.value = false;
});

onUnmounted(disposeCapture);
</script>
<template>
  <video ref="video" class="video" autoplay playsinline></video>
  <canvas ref="canvas" class="canvas"></canvas>
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
