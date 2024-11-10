<script setup lang="ts">
import { ElCarousel, ElCarouselItem } from "element-plus";
import { useData } from "vitepress";

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter } = useData();
</script>

<template>
  <div class="layout">
    <main>
      <div class="contents-box">
        <div class="contents-side">
          <div class="appicon-container">
            <img class="appicon" :src="site.themeConfig.appicon" alt="logo" />
          </div>
          <div v-if="frontmatter.home">
            <h1>{{ site.title }}</h1>
            <p>{{ site.description }}</p>
          </div>
        </div>
        <div class="thumbnails-side">
          <ElCarousel class="thumbnails-carousel" height="100%">
            <ElCarouselItem
              v-for="thumbnail in site.themeConfig.thumbnails"
              :key="thumbnail"
              class="thumnail-item"
            >
              <img class="thumbnail" :src="thumbnail" alt="thumbnail" />
            </ElCarouselItem>
          </ElCarousel>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
main {
  color: #fff;
}
.contents-box {
  width: 800px;
  height: 400px;
  box-shadow: 0 2px 24px 4px rgba(0, 0, 0, 0.32);
  border-radius: 16px;
  margin: 0 auto;
  background-color: rgba(0, 0, 0, 0.5);
  display: grid;
  grid-template-columns: 50% 50%;
  overflow: hidden;
}
.contents-side {
  width: 50%;
  padding: 24px;
  height: 100%;
}
.appicon-container {
  height: calc(50% - 40px);
}
.appicon {
  display: inline-flex;
  width: 128px;
  height: 128px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background-color: rgba(255, 255, 255, 0.32);
  border-radius: 16px;
}
.thumbnails-side {
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  .thumbnails-carousel {
    height: 100%;
    .thumbnail-item {
      height: 100%;
    }
    .thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
