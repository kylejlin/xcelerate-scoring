import { User } from "../api";

import { AppState, StateOf } from "./states";
import Option from "./Option";
import { format } from "path";

export interface UnknownScreenHandle {
  pushScreen<T extends AppState["kind"]>(
    kind: T,
    state: Omit<StateOf<T>, "kind" | "screenNumber">
  ): Promise<ScreenHandle<T>>;
  getUser(): Option<User>;
}

export interface ScreenHandle<T extends AppState["kind"]> {
  state: StateOf<T>;
  expiration: Promise<void>;
  hasExpired(): boolean;
  pushScreen<T extends AppState["kind"]>(
    kind: T,
    state: Omit<StateOf<T>, "kind" | "screenNumber">
  ): Promise<ScreenHandle<T>>;
  update(
    state:
      | (Partial<Omit<StateOf<T>, "kind" | "screenNumber">>)
      | ((
          prevState: StateOf<T>
        ) => Partial<Omit<StateOf<T>, "kind" | "screenNumber">>)
  ): void;
}

export interface ScreenGuarantee<T extends AppState["kind"]> {
  getCurrentScreen(): ScreenHandle<T>;
}
