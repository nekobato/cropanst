import { app } from "electron";
import path from "node:path";

export const isDevelopment = process.env.NODE_ENV === "development";
export const root = path.join(__dirname, "..");

export const mainRoot = path.join(__dirname, "../main");
export const rendererRoot = path.join(__dirname, "../renderer");
export const preloadRoot = path.join(__dirname, "../preload");
export const resourcesRoot = app.isPackaged
  ? path.join(__dirname, "../resources")
  : path.join(__dirname, "../resources");
export const serverUrl = process.env["ELECTRON_RENDERER_URL"];

export const preload = path.join(preloadRoot, "index.js");

export const pageRoot = serverUrl
  ? (serverUrl as string) // dev
  : path.join(rendererRoot, "index.html"); // prod
