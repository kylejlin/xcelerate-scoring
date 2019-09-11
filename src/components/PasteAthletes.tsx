import React from "react";

import { PasteAthletesState } from "../types/states";
import { PasteAthletesController } from "../types/controllers";

export default function PasteAthletes({
  state,
  controller,
}: Props): React.ReactElement {
  return (
    <div className="App">
      <button onClick={controller.navigateToSearchForSeasonScreen}>
        Search for season
      </button>
      <button onClick={controller.navigateToUserSeasonsScreen}>
        Your seasons
      </button>
      <button onClick={controller.navigateToUserProfileScreen}>Profile</button>
      <button onClick={controller.navigateToAthletesMenu}>Back</button>
      <h2>{state.seasonSummary.name} - Paste athletes</h2>
      <p>Copy your roster from a Google Sheet and paste it below.</p>
      <textarea
        value={state.spreadsheetData}
        onChange={controller.editSpreadsheetData}
      ></textarea>
      <p>These athletes are from: </p>
      {state.schools.match({
        none: () => <p>Loading schools...</p>,
        some: schools => (
          <select
            value={state.selectedSchool.unwrapOr("")}
            onChange={controller.editSchool}
          >
            <option value="">--Please choose a school--</option>
            {schools.map(school => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
        ),
      })}
      {state.selectedSchool.match({
        none: () => null,
        some: () => (
          <button onClick={controller.submitSpreadsheetData}>Next</button>
        ),
      })}
    </div>
  );
}

interface Props {
  state: PasteAthletesState;
  controller: PasteAthletesController;
}
