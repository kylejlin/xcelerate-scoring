import React from "react";

import { AthletesMenuState } from "../types/states";
import { AthletesMenuController } from "../types/controllers";
import {
  Athlete,
  EditableAthleteField,
  AthleteFilter,
  Gender,
  TeamsRecipe,
  PendingAthleteEdit,
} from "../types/misc";
import inclusiveIntRange from "../inclusiveIntRange";
import Option from "../types/Option";

export default function AthletesMenu({
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
      <h2>{state.seasonSummary.name} - Athletes</h2>
      {state.doesUserHaveWriteAccess &&
        state.deleteAthletes.match({
          none: () => (
            <>
              <button onClick={controller.navigateToPasteAthletesScreen}>
                Paste athletes
              </button>
              <button onClick={controller.navigateToManuallyAddAthletesScreen}>
                Manually add athletes
              </button>
              <button onClick={controller.openDeleteAthletesSubscreen}>
                Delete athletes
              </button>
            </>
          ),
          some: () => (
            <button onClick={controller.closeDeleteAthletesSubscreen}>
              Cancel deletions
            </button>
          ),
        })}
      {state.teamsRecipe.match({
        none: () => <p>Loading athlete filters...</p>,
        some: filterOptions => (
          <div>
            <h3>Athlete filters</h3>
            <label>
              School:
              <select
                value={state.athleteFilter.school.unwrapOr("")}
                onChange={controller.editFilterSchool}
              >
                <option value="">Any</option>
                {filterOptions.schools.map(school => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Grade:
              <select
                value={state.athleteFilter.grade.map(String).unwrapOr("")}
                onChange={controller.editFilterGrade}
              >
                <option value="">Any</option>
                {inclusiveIntRange(
                  filterOptions.minGrade,
                  filterOptions.maxGrade
                )
                  .map(String)
                  .map(grade => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Gender:
              <select
                value={state.athleteFilter.gender.unwrapOr("")}
                onChange={controller.editFilterGender}
              >
                <option value="">Any</option>
                <option value={Gender.Male}>M</option>
                <option value={Gender.Female}>F</option>
              </select>
            </label>
          </div>
        ),
      })}

      <label>
        Sort athletes by{" "}
        <select
          value={state.shouldSortByLastName ? "Last" : "First"}
          onChange={controller.editSortPreference}
        >
          <option value="First">First name</option>
          <option value="Last">Last name</option>
        </select>
      </label>

      {state.doesUserHaveWriteAccess && (
        <>
          <p>Click on a field to edit it.</p>
          <p>
            {(() => {
              const athletesBeingSaved =
                state.pendingEditsBeingSyncedWithFirestore.length;
              if (athletesBeingSaved === 0) {
                return "All athletes saved.";
              } else if (athletesBeingSaved === 1) {
                return "Saving 1 athlete...";
              } else {
                return "Saving " + athletesBeingSaved + " athletes...";
              }
            })()}
          </p>
        </>
      )}

      {Option.all([state.athletes, state.teamsRecipe]).match({
        none: () => <p>Loading...</p>,
        some: ([athletes, teamsRecipe]) => (
          <>
            {state.deleteAthletes.match({
              none: () => (
                <AthletesTable
                  state={{
                    athletes,
                    teamsRecipe,
                    athleteFilter: state.athleteFilter,
                    shouldSortByLastName: state.shouldSortByLastName,
                    pendingAthleteEdit: state.pendingAthleteEdit,
                  }}
                  controller={controller}
                />
              ),
              some: deleteAthletesState => (
                <DeleteAthletesTable
                  state={{
                    athletes,
                    athleteFilter: state.athleteFilter,
                    shouldSortByLastName: state.shouldSortByLastName,
                    undeletableIds: deleteAthletesState.undeletableIds,
                    idsConsideredForDeletion:
                      deleteAthletesState.idsConsideredForDeletion,
                    isUserBeingGivenFinalWarning:
                      deleteAthletesState.isUserBeingGivenFinalWarning,
                    areAthletesBeingDeleted:
                      deleteAthletesState.areAthletesBeingDeleted,
                  }}
                  controller={controller}
                />
              ),
            })}

            {state.deleteAthletes.isNone() &&
              (state.isSpreadsheetDataShown ? (
                <div>
                  <button onClick={controller.hideSpreadsheetData}>
                    Hide spreadsheet data
                  </button>
                  <div className="TempSpreadsheetData">
                    {"ID\tFirst\tLast\tGrade\tGender\tSchool\n" +
                      filterAndSortAthletes(
                        athletes,
                        state.athleteFilter,
                        state.shouldSortByLastName
                      )
                        .map(getAthleteRowText)
                        .join("\n")}
                  </div>
                </div>
              ) : (
                <button onClick={controller.showSpreadsheetData}>
                  Show copyable spreadsheet data
                </button>
              ))}
          </>
        ),
      })}
    </div>
  );
}

interface Props {
  state: AthletesMenuState;
  controller: AthletesMenuController;
}

function AthletesTable({
  state,
  controller,
}: EditableAthletesTableProps): React.ReactElement {
  const {
    athletes,
    teamsRecipe,
    athleteFilter,
    shouldSortByLastName,
    pendingAthleteEdit,
  } = state;
  const [idOfEditedAthlete, editedField, fieldValue] = pendingAthleteEdit.match(
    {
      none: () => [null, null, ""],
      some: edit => [edit.athleteId, edit.editedField, edit.fieldValue],
    }
  );
  const orderedAthletes = filterAndSortAthletes(
    athletes,
    athleteFilter,
    shouldSortByLastName
  );
  return (
    <table>
      <tbody>
        <tr>
          <th>ID</th>
          <th>First</th>
          <th>Last</th>
          <th>Grade</th>
          <th>Gender</th>
          <th>School</th>
        </tr>
        {orderedAthletes.map(athlete => (
          <tr key={athlete.id}>
            <td>#{athlete.id}</td>
            <td>
              {idOfEditedAthlete === athlete.id &&
              editedField === EditableAthleteField.FirstName ? (
                <input
                  type="text"
                  value={fieldValue}
                  onChange={controller.editSelectedAthleteField}
                  onBlur={controller.syncAndUnfocusEditedAthleteField}
                />
              ) : (
                <span
                  onClick={() =>
                    controller.selectAthleteFieldToEditIfUserHasWriteAccess(
                      athlete.id,
                      EditableAthleteField.FirstName
                    )
                  }
                >
                  {athlete.firstName}
                </span>
              )}
            </td>
            <td>
              {idOfEditedAthlete === athlete.id &&
              editedField === EditableAthleteField.LastName ? (
                <input
                  type="text"
                  value={fieldValue}
                  onChange={controller.editSelectedAthleteField}
                  onBlur={controller.syncAndUnfocusEditedAthleteField}
                />
              ) : (
                <span
                  onClick={() =>
                    controller.selectAthleteFieldToEditIfUserHasWriteAccess(
                      athlete.id,
                      EditableAthleteField.LastName
                    )
                  }
                >
                  {athlete.lastName}
                </span>
              )}
            </td>
            <td>
              {idOfEditedAthlete === athlete.id &&
              editedField === EditableAthleteField.Grade ? (
                <select
                  value={fieldValue}
                  onChange={controller.editSelectedAthleteField}
                  onBlur={controller.syncAndUnfocusEditedAthleteField}
                >
                  {inclusiveIntRange(teamsRecipe.minGrade, teamsRecipe.maxGrade)
                    .map(String)
                    .map(grade => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                </select>
              ) : (
                <span
                  onClick={() =>
                    controller.selectAthleteFieldToEditIfUserHasWriteAccess(
                      athlete.id,
                      EditableAthleteField.Grade
                    )
                  }
                >
                  {athlete.grade}
                </span>
              )}
            </td>
            <td>
              {idOfEditedAthlete === athlete.id &&
              editedField === EditableAthleteField.Gender ? (
                <select
                  value={fieldValue}
                  onChange={controller.editSelectedAthleteField}
                  onBlur={controller.syncAndUnfocusEditedAthleteField}
                >
                  <option value={Gender.Male}>M</option>
                  <option value={Gender.Female}>F</option>
                </select>
              ) : (
                <span
                  onClick={() =>
                    controller.selectAthleteFieldToEditIfUserHasWriteAccess(
                      athlete.id,
                      EditableAthleteField.Gender
                    )
                  }
                >
                  {athlete.gender}
                </span>
              )}
            </td>
            <td>
              {idOfEditedAthlete === athlete.id &&
              editedField === EditableAthleteField.School ? (
                <select
                  value={fieldValue}
                  onChange={controller.editSelectedAthleteField}
                  onBlur={controller.syncAndUnfocusEditedAthleteField}
                >
                  {teamsRecipe.schools.map(school => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  onClick={() =>
                    controller.selectAthleteFieldToEditIfUserHasWriteAccess(
                      athlete.id,
                      EditableAthleteField.School
                    )
                  }
                >
                  {athlete.school}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface EditableAthletesTableProps {
  state: {
    athletes: Athlete[];
    teamsRecipe: TeamsRecipe;
    athleteFilter: AthleteFilter;
    shouldSortByLastName: boolean;
    pendingAthleteEdit: Option<PendingAthleteEdit>;
  };
  controller: AthletesMenuController;
}

function DeleteAthletesTable({
  state,
  controller,
}: DeleteAthletesTableProps): React.ReactElement {
  if (state.areAthletesBeingDeleted) {
    const numberOfAthletes = state.idsConsideredForDeletion.length;
    return (
      <p>
        Deleting {numberOfAthletes} athlete{numberOfAthletes === 1 ? "" : "s"}
        ...
      </p>
    );
  } else {
    const {
      athletes,
      athleteFilter,
      shouldSortByLastName,
      undeletableIds,
      isUserBeingGivenFinalWarning,
      idsConsideredForDeletion,
    } = state;
    const numberOfDeletedAthletes = idsConsideredForDeletion.length;
    const orderedAthletes = filterAndSortAthletes(
      athletes,
      athleteFilter,
      shouldSortByLastName
    );
    return undeletableIds.match({
      none: () => <p>Loading...</p>,
      some: undeletableIds => (
        <>
          <p>
            Select which athletes you want to delete. The deletion will be
            irreversible. Athletes who finished one or more meets cannot be
            deleted until they are deleted from those meets.
          </p>
          <table>
            <tbody>
              <tr>
                <th>ID</th>
                <th>First</th>
                <th>Last</th>
                <th>Grade</th>
                <th>Gender</th>
                <th>School</th>
                <th>Delete?</th>
              </tr>
              {orderedAthletes.map(athlete => (
                <tr key={athlete.id}>
                  <td>#{athlete.id}</td>
                  <td>
                    <span>{athlete.firstName}</span>
                  </td>
                  <td>
                    <span>{athlete.lastName}</span>
                  </td>
                  <td>
                    <span>{athlete.grade}</span>
                  </td>
                  <td>
                    <span>{athlete.gender}</span>
                  </td>
                  <td>
                    <span>{athlete.school}</span>
                  </td>
                  <td>
                    {!undeletableIds.includes(parseInt(athlete.id, 10)) && (
                      <input
                        type="checkbox"
                        checked={idsConsideredForDeletion.includes(
                          parseInt(athlete.id, 10)
                        )}
                        onChange={event =>
                          controller.toggleAthleteDeletion(
                            event,
                            parseInt(athlete.id, 10)
                          )
                        }
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isUserBeingGivenFinalWarning ? (
            <div>
              <h3>
                Are you sure you want to delete {numberOfDeletedAthletes}{" "}
                athlete
                {numberOfDeletedAthletes === 1 ? "" : "s"}?
              </h3>
              <p>This action is irreversible.</p>
              <button onClick={controller.abortAthleteDeletion}>Abort</button>
              <button onClick={controller.confirmAthleteDeletion}>
                Delete athletes
              </button>
            </div>
          ) : (
            <button onClick={controller.giveUserFinalWarning}>
              Delete athlete{numberOfDeletedAthletes === 1 ? "" : "s"}
            </button>
          )}
        </>
      ),
    });
  }
}

interface DeleteAthletesTableProps {
  state: {
    athletes: Athlete[];
    athleteFilter: AthleteFilter;
    shouldSortByLastName: boolean;
    undeletableIds: Option<number[]>;
    idsConsideredForDeletion: number[];
    isUserBeingGivenFinalWarning: boolean;
    areAthletesBeingDeleted: boolean;
  };
  controller: AthletesMenuController;
}

function filterAndSortAthletes(
  athletes: Athlete[],
  filter: AthleteFilter,
  shouldSortByLastName: boolean
): Athlete[] {
  return filterAthletes(athletes, filter).sort(
    athleteSorter(shouldSortByLastName)
  );
}

function filterAthletes(athletes: Athlete[], filter: AthleteFilter): Athlete[] {
  return athletes.filter(athlete => {
    return (
      filter.school.match({
        none: () => true,
        some: school => school === athlete.school,
      }) &&
      filter.grade.match({
        none: () => true,
        some: grade => grade === athlete.grade,
      }) &&
      filter.gender.match({
        none: () => true,
        some: gender => gender === athlete.gender,
      })
    );
  });
}

function athleteSorter(
  shouldSortByLastName: boolean
): (a: Athlete, b: Athlete) => number {
  if (shouldSortByLastName) {
    return sortByLastName;
  } else {
    return sortByFirstName;
  }
}

function sortByLastName(a: Athlete, b: Athlete): number {
  if (a.lastName < b.lastName) {
    return -1;
  } else if (a.lastName > b.lastName) {
    return 1;
  } else {
    return 0;
  }
}

function sortByFirstName(a: Athlete, b: Athlete): number {
  if (a.firstName < b.firstName) {
    return -1;
  } else if (a.firstName > b.firstName) {
    return 1;
  } else {
    return 0;
  }
}

function getAthleteRowText(athlete: Athlete): string {
  return (
    "#" +
    athlete.id +
    "\t" +
    athlete.firstName +
    "\t" +
    athlete.lastName +
    "\t" +
    athlete.grade +
    "\t" +
    athlete.gender +
    "\t" +
    athlete.school
  );
}
