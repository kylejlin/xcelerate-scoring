import React from "react";
import { SearchForSeasonState } from "../types/states";
import { SearchForSeasonController } from "../types/controllers";

export default function SearchForSeason({
  state,
  controller,
}: Props): React.ReactElement {
  return (
    <div className="App">
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

      <p>Search for season</p>
      <label>
        Name:{" "}
        <input
          type="text"
          value={state.query}
          onChange={controller.editQuery}
        />
      </label>
      <button onClick={controller.search}>Search</button>

      {state.isLoading ? (
        <p>Loading</p>
      ) : (
        state.seasons.match({
          none: () => null,
          some: seasonSummaries => (
            <>
              <p>Results:</p>
              <ul>
                {seasonSummaries.map(summary => (
                  <li
                    key={summary.id}
                    onClick={() => controller.viewSeason(summary)}
                  >
                    {summary.name}
                  </li>
                ))}
              </ul>
            </>
          ),
        })
      )}
    </div>
  );
}

interface Props {
  state: SearchForSeasonState;
  controller: SearchForSeasonController;
}
