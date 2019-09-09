import React from "react";

import { UserSeasonsState } from "../types/states";
import { UserSeasonsController } from "../types/controllers";

export default function UserSeasons({
  state,
  controller,
}: Props): React.ReactElement {
  return (
    <div className="App">
      <button onClick={controller.navigateToSearchForSeasonScreen}>
        Search for season
      </button>
      <button onClick={controller.navigateToUserProfileScreen}>Profile</button>
      {state.seasons.match({
        none: () => <p>Loading your seasons</p>,
        some: seasonSummaries => (
          <>
            <p>Your seasons: </p>
            <ul>
              {seasonSummaries.length === 0 ? (
                <p>You have no seasons. Try creating one!</p>
              ) : (
                seasonSummaries.map(summary => (
                  <li
                    key={summary.id}
                    onClick={() => controller.viewSeason(summary)}
                  >
                    {summary.name}
                  </li>
                ))
              )}
            </ul>
          </>
        ),
      })}
      <button onClick={controller.navigateToCreateSeasonScreen}>
        Create season
      </button>
    </div>
  );
}

interface Props {
  state: UserSeasonsState;
  controller: UserSeasonsController;
}
