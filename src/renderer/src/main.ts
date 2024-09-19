import { createApp } from "vue";
import router from "./router";
import App from "./App.vue";
import "@/styles/reset.css";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "@/styles/fonts.css";

createApp(App).use(router).mount("#app").$nextTick(window.removeLoading);
