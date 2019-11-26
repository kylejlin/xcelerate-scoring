import { XcelerateWindow, checkXcelerateWindowHooks } from "./hooks";

export default function deferAppInitUntil(pathname: string, stubber: Stubber) {
  cy.window().then(win => {
    win.localStorage.setItem("__shouldWaitForStubs__", "true");
  });

  cy.visit(pathname);

  cy.window().then(win => {
    const xcWin = checkXcelerateWindowHooks(win);

    stubber(xcWin);

    const { __onStubsAdded__ } = win as any;
    if ("function" === typeof __onStubsAdded__) {
      // Call `__onStubsAdded__` asynchronously so if it fails,
      //   the error will not stop the rest of the suites from
      //   being ran.
      requestAnimationFrame(__onStubsAdded__);
    }
  });
}

type Stubber = (xcWindow: XcelerateWindow) => void;
