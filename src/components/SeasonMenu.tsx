import React from "react";

import { SeasonMenuState } from "../types/states";
import { SeasonMenuController } from "../types/controllers";

export default function SeasonMenu({
  state,
  controller,
}: Props): React.ReactElement {
  return (
    <div className="App">
      <button onClick={controller.navigateToSearchForSeasonScreen}>
        Search for season
      </button>
      {state.user.match({
        none: () => (
          <button onClick={controller.navigateToSignInScreen}>Sign in</button>
        ),
        some: () => (
          <>
            <button onClick={controller.navigateToUserSeasonsScreen}>
              Your seasons
            </button>
            <button onClick={controller.navigateToUserProfileScreen}>
              Profile
            </button>
          </>
        ),
      })}
      <h2>{state.season.name}</h2>
      <button onClick={controller.navigateToAthletesMenu}>Athletes</button>
      <button onClick={controller.navigateToAssistantsMenu}>Assistants</button>
      <button onClick={controller.navigateToSeasonMeetsScreen}>Meets</button>
    </div>
  );
}

interface Props {
  state: SeasonMenuState;
  controller: SeasonMenuController;
}
