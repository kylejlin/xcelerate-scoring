import firebase from "./firebase";

import App from "./App";
import { StubbableApi } from "./api/StubbableApi";

export const LOCAL_STORAGE_DEFERRED_INIT_FLAG = "shouldDeferInitialization";

export interface Hooks {
  app: App;
  api: StubbableApi;
  errors: Error[];

  firebase: typeof firebase;

  onManipulationComplete?(): void;
}

export function getHooks(window: Window): Hooks {
  const { __xcelerateHooks__ } = window as any;

  if (!isObject(__xcelerateHooks__)) {
    throw new Error("`window.__xcelerateHooks__` is not an object.");
  }

  return __xcelerateHooks__ as Hooks;
}

function isObject(o: unknown): boolean {
  return "object" === typeof o && o !== null;
}

export function setHook<K extends keyof Hooks>(
  key: K,
  value: Hooks[K],
  customWindow?: Window
): void {
  const unsafeWin = (customWindow || window) as any;

  if (!isObject(unsafeWin.__xcelerateHooks__)) {
    unsafeWin.__xcelerateHooks__ = { errors: [] };
  }

  unsafeWin.__xcelerateHooks__[key] = value;
}
