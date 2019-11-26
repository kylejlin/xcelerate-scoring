import App from "../App";
import {
  UnknownScreenHandle,
  ScreenHandle,
  ScreenGuarantee,
} from "../types/handle";
import { AppState, StateOf } from "../types/states";
import Option from "../types/Option";
import { User } from "../api";

export function getUnknownScreenHandle(app: App): UnknownScreenHandle {
  return {
    pushScreen<T extends AppState["kind"]>(
      kind: T,
      state: Omit<StateOf<T>, "kind" | "screenNumber">
    ): Promise<ScreenHandle<T>> {
      return app.pushScreen(kind, state);
    },
    getUser(): Option<User> {
      return app.getUser();
    },
  };
}

export function getScreenGuarantee<T extends AppState["kind"]>(
  app: App
): ScreenGuarantee<T> {
  return {
    getCurrentScreen(): ScreenHandle<T> {
      return app.unsafeGetScreenHandle();
    },
  };
}
