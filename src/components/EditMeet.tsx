import React from "react";

import { EditMeetState } from "../types/states";
import { EditMeetController } from "../types/controllers";

import { RaceDivisionUtil, RaceActionType, RaceAction } from "../types/race";
import Option from "../types/Option";
import { Athlete } from "../types/misc";
import {
  describeDivisionInEnglish,
  addAppropriateOrdinalSuffix,
  doesGradeStartWithVowel,
} from "../english";
import zeroPadToFiveDigits from "../zeroPadToFiveDigits";

const ATHLETE_ID_INPUT_PLACEHOLDER: unique symbol = Symbol(
  "AthleteIdInputPlaceHolder"
);

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

      {Option.all([
        state.divisionsRecipe,
        state.orderedRaces,
        state.athletes,
      ]).match({
        none: () => <p>Loading races...</p>,
        some: ([divisionsRecipe, races, athletes]) => {
          const orderedDivisions = RaceDivisionUtil.getOrderedDivisions(
            divisionsRecipe
          );
          return state.editedDivision.match({
            none: () => (
              <div>
                <select value="" onChange={controller.selectDivision}>
                  <option value="">--Please select a division--</option>
                  {orderedDivisions
                    .map(RaceDivisionUtil.stringify)
                    .map(division => (
                      <option key={division} value={division}>
                        {division}
                      </option>
                    ))}
                </select>
              </div>
            ),
            some: editedDivision => {
              const editedRaceIndex = orderedDivisions.findIndex(division =>
                RaceDivisionUtil.areDivisionsEqual(division, editedDivision)
              );
              const finisherIds = races[editedRaceIndex];
              const divisionStr = RaceDivisionUtil.stringify(editedDivision);
              const insertionIndex = state.insertionIndex.unwrapOr(
                finisherIds.length
              );
              return (
                <div>
                  <select
                    value={divisionStr}
                    onChange={controller.selectDivision}
                  >
                    {orderedDivisions
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
                      const pendingActionsAffectingThisRace = state.pendingActions.filter(
                        pa => pa.raceIndex === editedRaceIndex
                      );
                      const indexedFinisherIds = finisherIds.map(
                        (id, index) => ({ id, index })
                      );
                      const idsWithInputPlaceholder = (indexedFinisherIds.slice(
                        0,
                        insertionIndex
                      ) as (
                        | IndexedFinisherId
                        | typeof ATHLETE_ID_INPUT_PLACEHOLDER)[])
                        .concat(ATHLETE_ID_INPUT_PLACEHOLDER)
                        .concat(indexedFinisherIds.slice(insertionIndex));
                      const idsWithInputPlaceholderAndAthleteSpecificPendingActions = idsWithInputPlaceholder.flatMap(
                        (idOrPlaceholder => {
                          if (
                            idOrPlaceholder === ATHLETE_ID_INPUT_PLACEHOLDER
                          ) {
                            return [ATHLETE_ID_INPUT_PLACEHOLDER];
                          } else {
                            const indexedId = idOrPlaceholder;
                            const insertionsAboveThisAthlete = pendingActionsAffectingThisRace.filter(
                              pa =>
                                pa.kind === RaceActionType.InsertAbove &&
                                pa.insertionIndex === indexedId.index
                            );
                            const deletion = state.pendingActions.find(
                              pa =>
                                pa.kind === RaceActionType.Delete &&
                                pa.athleteId === indexedId.id
                            );
                            return (insertionsAboveThisAthlete as (
                              | RaceAction
                              | IndexedFinisherId)[])
                              .concat([indexedId])
                              .concat(deletion === undefined ? [] : [deletion]);
                          }
                        }) as ((
                          athleteOrPlaceholder:
                            | IndexedFinisherId
                            | typeof ATHLETE_ID_INPUT_PLACEHOLDER
                        ) => (
                          | IndexedFinisherId
                          | typeof ATHLETE_ID_INPUT_PLACEHOLDER
                          | RaceAction)[])
                      );
                      const bottomInsertions = state.pendingActions.filter(
                        pa => pa.kind === RaceActionType.InsertAtBottom
                      );
                      const idsWithInputPlaceholderAndPendingActions = idsWithInputPlaceholderAndAthleteSpecificPendingActions.concat(
                        bottomInsertions
                      );

                      const insertAtBottomButton = (
                        <li key="insertAtBottom">
                          <button
                            onClick={() =>
                              controller.setInsertionIndex(Option.none())
                            }
                          >
                            Insert at bottom
                          </button>
                        </li>
                      );

                      return (
                        idsWithInputPlaceholderAndPendingActions
                          // Suppress extraneous warning about expecting
                          // arrow function return value.

                          // eslint-disable-next-line
                          .map(idOrPlaceholderOrAction => {
                            if (
                              idOrPlaceholderOrAction ===
                              ATHLETE_ID_INPUT_PLACEHOLDER
                            ) {
                              return (
                                <li key="pendingAthleteId">
                                  #
                                  <input
                                    type="number"
                                    value={state.pendingAthleteId}
                                    onChange={controller.editPendingAthleteId}
                                  />
                                </li>
                              );
                            } else if ("kind" in idOrPlaceholderOrAction) {
                              const action = idOrPlaceholderOrAction;
                              switch (action.kind) {
                                case RaceActionType.InsertAtBottom:
                                case RaceActionType.InsertAbove:
                                  return (
                                    <li
                                      key={
                                        action.kind +
                                        ":" +
                                        action.raceIndex +
                                        ":" +
                                        action.athleteId
                                      }
                                      className="TempPendingAction"
                                    >
                                      Adding #
                                      {zeroPadToFiveDigits(action.athleteId)}...
                                    </li>
                                  );
                                case RaceActionType.Delete:
                                  return (
                                    <li
                                      key={
                                        action.kind +
                                        ":" +
                                        action.raceIndex +
                                        ":" +
                                        action.athleteId
                                      }
                                      className="TempPendingAction"
                                    >
                                      Deleting #
                                      {zeroPadToFiveDigits(action.athleteId)}...
                                    </li>
                                  );
                              }
                            } else {
                              const {
                                index,
                                id: finisherId,
                              } = idOrPlaceholderOrAction;
                              const athlete = athletes.find(
                                athlete =>
                                  parseInt(athlete.id, 10) === finisherId
                              );
                              const place = index + 1;
                              const firstName =
                                athlete === undefined ? (
                                  <span>
                                    Athlete not found. Please reload the page.
                                  </span>
                                ) : (
                                  <span>{athlete.firstName}</span>
                                );
                              return (
                                <li key={finisherId}>
                                  <span>{place}. </span>
                                  {firstName}
                                  <button
                                    onClick={() =>
                                      controller.setInsertionIndex(
                                        Option.some(index)
                                      )
                                    }
                                  >
                                    Insert above
                                  </button>
                                  <button
                                    onClick={() =>
                                      controller.deleteAthlete(finisherId)
                                    }
                                  >
                                    Delete
                                  </button>
                                </li>
                              );
                            }
                          })
                          .concat(
                            state.insertionIndex.match({
                              none: () => [],
                              some: () => insertAtBottomButton,
                            })
                          )
                      );
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
                              #{athleteId} does not refer to an existent
                              athlete.
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
                            const indexInExistingFinishers = finisherIds.findIndex(
                              id => id === parseInt(athlete.id, 10)
                            );
                            const isAlreadyEntered =
                              indexInExistingFinishers !== -1;
                            if (isInWrongDivision) {
                              return (
                                <p>
                                  You tried to insert a
                                  {doesGradeStartWithVowel(division.grade)
                                    ? "n"
                                    : ""}{" "}
                                  {describeDivisionInEnglish(division)} in the{" "}
                                  {describeDivisionInEnglish(editedDivision)}'s
                                  race.
                                </p>
                              );
                            } else if (isAlreadyEntered) {
                              return (
                                <p>
                                  You tried to insert {fullName}, who has
                                  already been inserted in{" "}
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
                        <button
                          onClick={controller.dismissInsertionErrorMessage}
                        >
                          Dismiss
                        </button>
                      </div>
                    ),
                  })}
                </div>
              );
            },
          });
        },
      })}
    </div>
  );
}

interface IndexedFinisherId {
  index: number;
  id: number;
}

interface IndexedAthlete extends Athlete {
  index: number;
}

interface Props {
  state: EditMeetState;
  controller: EditMeetController;
}

function getAthlete(athleteId: string, athletes: Athlete[]): Option<Athlete> {
  const athlete = athletes.find(athlete => athlete.id === athleteId);
  return athlete !== undefined ? Option.some(athlete) : Option.none();
}
