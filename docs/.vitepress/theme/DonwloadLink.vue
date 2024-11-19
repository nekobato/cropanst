<script setup lang="ts">
import Bowser from "bowser";
import { Icon } from "@iconify/vue";
import { ThemeConfig } from "../types/themeConfig";

const props = defineProps<{ links: ThemeConfig["downloadLinks"] }>();

const visitorOS = Bowser.parse(window.navigator.userAgent).os;
</script>

<template>
  <section class="download-links">
    <h3>ダウンロード</h3>
    <div
      class="button-group"
      v-if="visitorOS.name === 'macOS' && props.links.macOS"
    >
      <a class="link-button" :href="props.links.macOS.arm64" download>
        <Icon icon="mingcute:apple-fill" class="icon" />
        <div class="os-name">
          <span class="os">macOS</span>
          <span class="arch">(Apple Silicon)</span>
        </div>
      </a>
      <a class="link-button" :href="props.links.macOS.x64" download>
        <Icon icon="mingcute:apple-fill" class="icon" />
        <div class="os-name">
          <span class="os">macOS</span>
          <span class="arch">(Intel)</span>
        </div>
      </a>
    </div>
    <div
      class="button-group"
      v-if="visitorOS.name === 'windows' && props.links.windows"
    >
      <a class="link-button" :href="props.links.windows.x64" download>
        <Icon icon="mingcute:windows-fill" class="icon" />
        <div class="os-name">
          <span class="os">Windows</span>
          <span class="arch">(x64)</span>
        </div>
      </a>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.download-links {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 12px 16px 10px;
  border: 1px solid var(--color-white-t100);
  border-radius: 12px;
}

.button-group {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 8px;
}

h3 {
  position: absolute;
  top: -6px;
  font-size: 12px;
  font-weight: bold;
  color: var(--color-grey-50);
  backdrop-filter: blur(4px);
  margin: 0;
  line-height: 1;
  padding: 0 4px;
}

.link-button {
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 8px 8px;
  width: 100%;
  border-radius: 8px;
  background-color: var(--color-grey-50);
  text-decoration: none;
  transition: background-color 0.1s;
  border: 1px solid transparent;
  border-radius: 8px;
  gap: 8px;

  &:hover {
    background-color: var(--color-grey-100);
  }

  * {
    flex: 0 0 auto;
  }

  .icon {
    width: 24px;
    height: 24px;
    color: var(--color-grey-400);
  }

  .os-name {
    display: flex;
    flex-direction: column;
    line-height: 1;
    color: var(--color-grey-600);

    .os {
      font-size: var(--font-size-18);
      font-weight: bold;
    }

    .arch {
      font-size: var(--font-size-12);
    }
  }
}
</style>
