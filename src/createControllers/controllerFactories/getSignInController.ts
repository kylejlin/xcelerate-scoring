import firebase from "../../firebase";

import App from "../../App";
import {
  SignInController,
  SharedControllerMethods,
} from "../../types/controllers";
import { StateType } from "../../types/states";
import LocalStorageKeys from "../../types/LocalStorageKeys";

export default function getSignInController(
  app: App,
  _shared: SharedControllerMethods
): SignInController {
  return {
    signInWithGoogle() {
      app.setState({ kind: StateType.WaitForSignInCompletion });
      localStorage.setItem(LocalStorageKeys.IsWaitingForSignIn, "true");
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    },
  };
}
