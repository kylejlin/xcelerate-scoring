import React from "react";

import { EditMeetState } from "../types/states";
import { EditMeetController } from "../types/controllers";

import { RaceDivisionUtil } from "../types/race";

export default function EditMeet({
  state,
  controller,
  inputRefs,
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
      <button onClick={() => controller.back}>Back</button>
      <h2>{state.meetSummary.name} - Edit</h2>

      {state.races.match({
        none: () => <p>Loading races...</p>,
        some: races => {
          const editedDivision = state.editedDivision.expect(
            "Should editedDivison should have been populated if races has loaded."
          );
          const divisionStr = RaceDivisionUtil.stringify(editedDivision);
          const race = races.getRace(editedDivision);
          return (
            <div>
              <select value={divisionStr} onChange={controller.selectDivision}>
                {races
                  .getDivisions()
                  .map(RaceDivisionUtil.stringify)
                  .map(division => (
                    <option key={division} value={division}>
                      {division}
                    </option>
                  ))}
              </select>
              <h3>{divisionStr}</h3>
              <ul>
                {race.getFinisherIds().map(athleteId => (
                  <li key={athleteId}>{athleteId}</li>
                ))}
              </ul>
            </div>
          );
        },
      })}

      {state.editedDivision.match({
        none: () => null,
        some: () => (
          <>
            <input
              type="number"
              value={state.pendingAthleteId.charAt(0)}
              onChange={controller.appendDigitToPendingAthleteId}
              ref={inputRefs[0]}
              onFocus={controller.focusCorrectInput}
              onKeyUp={controller.handlePossibleBackspace}
            />
            <input
              type="number"
              value={state.pendingAthleteId.charAt(1)}
              onChange={controller.appendDigitToPendingAthleteId}
              ref={inputRefs[1]}
              onFocus={controller.focusCorrectInput}
              onKeyUp={controller.handlePossibleBackspace}
            />
            <input
              type="number"
              value={state.pendingAthleteId.charAt(2)}
              onChange={controller.appendDigitToPendingAthleteId}
              ref={inputRefs[2]}
              onFocus={controller.focusCorrectInput}
              onKeyUp={controller.handlePossibleBackspace}
            />
            <input
              type="number"
              value={state.pendingAthleteId.charAt(3)}
              onChange={controller.appendDigitToPendingAthleteId}
              ref={inputRefs[3]}
              onFocus={controller.focusCorrectInput}
              onKeyUp={controller.handlePossibleBackspace}
            />
            <input
              type="number"
              value={state.pendingAthleteId.charAt(4)}
              onChange={controller.appendDigitToPendingAthleteId}
              ref={inputRefs[4]}
              onFocus={controller.focusCorrectInput}
              onKeyUp={controller.handlePossibleBackspace}
            />
          </>
        ),
      })}
    </div>
  );
}

interface Props {
  state: EditMeetState;
  controller: EditMeetController;
  inputRefs: React.RefObject<HTMLInputElement>[];
}
