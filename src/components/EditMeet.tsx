import React from "react";

import { EditMeetState } from "../types/states";
import { EditMeetController } from "../types/controllers";

import { RaceDivisionUtil } from "../types/race";
import Option from "../types/Option";

export default function EditMeet({
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
      <button onClick={() => controller.back}>Back</button>
      <h2>{state.meetSummary.name} - Edit</h2>

      {Option.all([state.races, state.athletes]).match({
        none: () => <p>Loading races...</p>,
        some: ([races, athletes]) => {
          const editedDivision = state.editedDivision.expect(
            "Should editedDivison should have been populated if races has loaded."
          );
          const divisionStr = RaceDivisionUtil.stringify(editedDivision);
          const race = races.getRace(editedDivision);
          const insertionIndex = state.insertionIndex.unwrapOr(
            race.getFinisherIds().length
          );
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
                {(() => {
                  const athleteNames = race
                    .getFinisherIds()
                    .map((athleteId, i) => {
                      const athlete = athletes.find(
                        athlete => athlete.id === athleteId
                      );
                      const place = i + 1;
                      const firstName =
                        athlete === undefined ? (
                          <span>
                            Athlete not found. Please reload the page.
                          </span>
                        ) : (
                          <span>{athlete.firstName}</span>
                        );
                      return (
                        <li key={athleteId}>
                          <span>{place}. </span>
                          {firstName}
                          <button
                            onClick={() =>
                              controller.setInsertionIndex(Option.some(i))
                            }
                          >
                            Insert above
                          </button>
                          <button
                            onClick={() => controller.deleteAthlete(athleteId)}
                          >
                            Delete
                          </button>
                        </li>
                      );
                    });
                  const pendingAthleteId = state.editedDivision.match({
                    none: () => [],
                    some: () => [
                      <li key="pendingAthleteId">
                        #
                        <input
                          type="number"
                          value={state.pendingAthleteId}
                          onChange={controller.editPendingAthleteId}
                        />
                      </li>,
                    ],
                  });
                  const insertAtBottom = state.insertionIndex.match({
                    none: () => [],
                    some: () => [
                      <li key="insertAtBottom">
                        <button
                          onClick={() =>
                            controller.setInsertionIndex(Option.none())
                          }
                        >
                          Insert at bottom
                        </button>
                      </li>,
                    ],
                  });
                  return athleteNames
                    .slice(0, insertionIndex)
                    .concat(pendingAthleteId)
                    .concat(athleteNames.slice(insertionIndex))
                    .concat(insertAtBottom);
                })()}
              </ul>
            </div>
          );
        },
      })}
    </div>
  );
}

interface Props {
  state: EditMeetState;
  controller: EditMeetController;
}
