import React from "react";

import { SignInState } from "../types/states";
import { SignInController } from "../types/controllers";

export default function SignIn({
  state,
  controller,
}: Props): React.ReactElement {
  return (
    <div className="App">
      <button onClick={controller.signInWithGoogle}>Sign in with Google</button>
    </div>
  );
}

interface Props {
  state: SignInState;
  controller: SignInController;
}
