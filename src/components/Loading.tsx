import React from "react";

import { LoadingState } from "../types/states";

export default function Loading({ state }: Props): React.ReactElement {
  return (
    <div className="App">
      {state.isWaitingForSignInCompletion ? (
        <p>Signing you in. Please wait.</p>
      ) : (
        <p>Loading... Please wait.</p>
      )}
    </div>
  );
}

interface Props {
  state: LoadingState;
}
