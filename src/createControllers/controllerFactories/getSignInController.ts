import firebase from "../../firebase";

import { SignInController } from "../../types/controllers";
import { StateType } from "../../types/states";
import LocalStorageKeys from "../../types/LocalStorageKeys";
import { ScreenGuarantee } from "../../types/handle";

export default function getSignInController({
  getCurrentScreen,
}: ScreenGuarantee<StateType.SignIn>): SignInController {
  return {
    signInWithGoogle() {
      const screen = getCurrentScreen();
      screen.update({ kind: StateType.Loading });
      localStorage.setItem(LocalStorageKeys.IsWaitingForSignIn, "true");
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    },
  };
}
