import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Stream from "@/views/Stream.vue";
import Cropper from "@/views/Cropper.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/stream",
    name: "stream",
    component: Stream,
  },
  {
    path: "/cropper/:displayId",
    name: "cropper",
    component: Cropper,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
