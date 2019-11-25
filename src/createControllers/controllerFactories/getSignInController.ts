import { SignInController } from "../../types/controllers";
import { StateType } from "../../types/states";
import LocalStorageKeys from "../../types/LocalStorageKeys";
import { ScreenGuarantee } from "../../types/handle";
import { api } from "../../api/";

export default function getSignInController({
  getCurrentScreen,
}: ScreenGuarantee<StateType.SignIn>): SignInController {
  return {
    signInWithGoogle() {
      const screen = getCurrentScreen();
      screen.update({ kind: StateType.Loading });
      localStorage.setItem(LocalStorageKeys.IsWaitingForSignIn, "true");

      api.signIntoGoogleWithRedirect();
    },
  };
}
