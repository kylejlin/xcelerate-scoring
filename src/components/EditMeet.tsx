import React from "react";

import { EditMeetState } from "../types/states";
import { EditMeetController } from "../types/controllers";

import { RaceDivisionUtil } from "../types/race";
import Option from "../types/Option";
import { Athlete } from "../types/misc";
import {
  describeDivisionInEnglish,
  addAppropriateOrdinalSuffix,
} from "../english";

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
      <button onClick={controller.back}>Back</button>
      <h2>{state.meetSummary.name} - Edit results</h2>

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

              {state.athleteIdWhichCouldNotBeInserted.match({
                none: () => null,
                some: athleteId => (
                  <div>
                    <h3>Error inserting athlete #{athleteId}</h3>
                    {getAthlete(athleteId, athletes).match({
                      none: () => (
                        <p>
                          #{athleteId} does not refer to an existent athlete.
                        </p>
                      ),
                      some: athlete => {
                        const division = RaceDivisionUtil.getAthleteDivision(
                          athlete
                        );
                        const isInWrongDivision = !RaceDivisionUtil.areDivisionsEqual(
                          division,
                          editedDivision
                        );
                        const fullName =
                          athlete.firstName + " " + athlete.lastName;
                        const indexInExistingFinishers = race
                          .getFinisherIds()
                          .findIndex(id => id === athlete.id);
                        const isAlreadyEntered =
                          indexInExistingFinishers !== -1;
                        if (isInWrongDivision) {
                          return (
                            <p>
                              You tried to insert a{" "}
                              {describeDivisionInEnglish(division)} in the{" "}
                              {describeDivisionInEnglish(editedDivision)}'s
                              race.
                            </p>
                          );
                        } else if (isAlreadyEntered) {
                          return (
                            <p>
                              You tried to insert {fullName}, who has already
                              been inserted in{" "}
                              {addAppropriateOrdinalSuffix(
                                indexInExistingFinishers + 1
                              )}{" "}
                              place.
                            </p>
                          );
                        } else {
                          return <p>Sorry, that's all we know.</p>;
                        }
                      },
                    })}
                    <button onClick={controller.dismissInsertionErrorMessage}>
                      Dismiss
                    </button>
                  </div>
                ),
              })}
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

function getAthlete(athleteId: string, athletes: Athlete[]): Option<Athlete> {
  const athlete = athletes.find(athlete => athlete.id === athleteId);
  return athlete !== undefined ? Option.some(athlete) : Option.none();
}
