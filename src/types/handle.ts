import firebase from "../firebase";

import { AppState, StateOf } from "./states";
import Option from "./Option";

export interface UnknownScreenHandle {
  pushScreen<T extends AppState["kind"]>(
    kind: T,
    state: Omit<StateOf<T>, "kind" | "screenNumber">
  ): Promise<ScreenHandle<T>>;
  getUser(): Option<firebase.User>;
}

export interface ScreenHandle<T extends AppState["kind"]> {
  state: StateOf<T>;
  expiration: Promise<void>;
  hasExpired(): boolean;
  pushScreen<T extends AppState["kind"]>(
    kind: T,
    state: Omit<StateOf<T>, "kind" | "screenNumber">
  ): Promise<ScreenHandle<T>>;
  update(state: Partial<Omit<StateOf<T>, "kind" | "screenNumber">>): void;
}

export interface ScreenGuarantee<T extends AppState["kind"]> {
  getCurrentScreen(): ScreenHandle<T>;
}
