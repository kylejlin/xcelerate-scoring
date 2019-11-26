import App from "../src/App";
import { StubbableApi } from "../src/api/StubbableApi";

export interface XcelerateWindow extends Window {
  app: App;
  __stubbableApi__: StubbableApi;
}

export function checkXcelerateWindowHooks(window: Window): XcelerateWindow {
  const { app, __stubbableApi__ } = window as any;

  // Can't use instanceof because that would require
  //   the compiler to emit code for `App` instead of
  //   just using its type.
  if (!isObject(app)) {
    throw new Error("`window.app` is not an object.");
  }

  if (!isObject(__stubbableApi__)) {
    throw new Error("`window.__stubbableApi__` is not an object.");
  }

  return window as XcelerateWindow;
}

function isObject(o: unknown): boolean {
  return "object" === typeof o && o !== null;
}
