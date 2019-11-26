import {
  getHooks,
  Hooks,
  LOCAL_STORAGE_DEFERRED_INIT_FLAG,
} from "../src/testingHooks";

export default function visitAndManipulatePage(
  pathname: string,
  callback: (hooks: Hooks) => void
) {
  cy.window().then(win => {
    win.localStorage.setItem(LOCAL_STORAGE_DEFERRED_INIT_FLAG, "true");
  });

  cy.visit(pathname);

  cy.window().then(win => {
    const hooks = getHooks(win);

    callback(hooks);

    if ("function" === typeof hooks.onManipulationComplete) {
      // Call `onStubsAdded` asynchronously so if it fails,
      //   the error will not stop the rest of the suites from
      //   being ran.
      requestAnimationFrame(hooks.onManipulationComplete);
    }
  });
}
