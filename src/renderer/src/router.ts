import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Stream from "@/views/Stream.vue";
import Cropper from "@/views/Cropper.vue";
import Frame from "@/views/Frame.vue";

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
  {
    path: "/frame",
    name: "frame",
    component: Frame,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
