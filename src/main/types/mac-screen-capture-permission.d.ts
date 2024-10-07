declare module "mac-screen-capture-permission" {
  export function hasScreenCapturePermission(): boolean;
  export function hasPromptedForPermission(): boolean;
}
