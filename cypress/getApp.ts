import App from "../src/App";

export default function getApp(window: Window): App {
  const { app } = window as any;

  // Can't use instanceof because that would require
  //   the compiler to emit code for `App` instead of
  //   just using its type.
  if ("object" === typeof app && app !== null) {
    return app;
  } else {
    throw new Error("`window.app` is not an object.");
  }
}
