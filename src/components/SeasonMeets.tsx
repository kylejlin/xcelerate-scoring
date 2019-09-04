import React from "react";

import { SeasonMeetsState } from "../types/states";
import { SeasonMeetsController } from "../types/controllers";

export default function SeasonMeets({
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
      <button onClick={() => controller.viewSeason(state.seasonSummary)}>
        Back
      </button>
      <h2>{state.seasonSummary.name} - Meets</h2>

      {state.meets.match({
        none: () => <p>Loading meets...</p>,
        some: meets =>
          meets.length === 0 ? (
            <p>You have no meets. Try creating one!</p>
          ) : (
            <ul>
              {meets.map(meet => (
                <li key={meet.id}>
                  <span>{meet.name}</span>
                  <button onClick={() => controller.viewMeet(meet)}>
                    View
                  </button>
                  {state.doesUserHaveWriteAccess && (
                    <button onClick={() => controller.editMeet(meet)}>
                      Edit
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ),
      })}

      {state.gradeBounds.match({
        none: () => null,
        some: () => (
          <>
            {" "}
            <input
              type="text"
              value={state.pendingMeetName}
              onChange={controller.editPendingMeetName}
            />
            <button onClick={controller.addMeet}>Add meet</button>
          </>
        ),
      })}
    </div>
  );
}

interface Props {
  state: SeasonMeetsState;
  controller: SeasonMeetsController;
}
