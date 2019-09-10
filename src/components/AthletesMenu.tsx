import React from "react";

import { AthletesMenuState } from "../types/states";
import { AthletesMenuController } from "../types/controllers";
import {
  Athlete,
  EditableAthleteField,
  AthleteFilter,
  Gender,
} from "../types/misc";
import inclusiveIntRange from "../inclusiveIntRange";
import { getGenderSubjectPronoun } from "../english";

export default function AthletesMenu({
  state,
  controller,
}: Props): React.ReactElement {
  const [
    idOfEditedAthlete,
    editedField,
    fieldValue,
  ] = state.pendingAthleteEdit.match({
    none: () => [null, null, ""],
    some: edit => [edit.athleteId, edit.editedField, edit.fieldValue],
  });
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
      {state.doesUserHaveWriteAccess && (
        <>
          <button onClick={controller.navigateToPasteAthletesScreen}>
            Paste athletes
          </button>
          <button onClick={controller.navigateToManuallyAddAthleteScreen}>
            Manually add athlete
          </button>
        </>
      )}
      {state.raceDivisions.match({
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

      {state.athletes.match({
        none: () => <p>Loading athletes...</p>,
        some: athletes => (
          <>
            <table>
              <tbody>
                <tr>
                  <th>ID</th>
                  <th>First</th>
                  <th>Last</th>
                  <th>Grade</th>
                  <th>Gender</th>
                  <th>School</th>
                  <th></th>
                </tr>
                {filterAndSortAthletes(
                  athletes,
                  state.athleteFilter,
                  state.shouldSortByLastName
                ).map(athlete => (
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
                        state.raceDivisions.match({
                          none: () => <p>Loading eligible grades...</p>,
                          some: filterOptions => (
                            <select
                              value={fieldValue}
                              onChange={controller.editSelectedAthleteField}
                              onBlur={
                                controller.syncAndUnfocusEditedAthleteField
                              }
                            >
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
                          ),
                        })
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
                        state.raceDivisions.match({
                          none: () => <p>Loading schools...</p>,
                          some: filterOptions => (
                            <select
                              value={fieldValue}
                              onChange={controller.editSelectedAthleteField}
                              onBlur={
                                controller.syncAndUnfocusEditedAthleteField
                              }
                            >
                              {filterOptions.schools.map(school => (
                                <option key={school} value={school}>
                                  {school}
                                </option>
                              ))}
                            </select>
                          ),
                        })
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
                    <td>
                      {state.doesUserHaveWriteAccess && (
                        <button
                          onClick={() =>
                            controller.considerAthleteForDeletion(athlete)
                          }
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {state.isSpreadsheetDataShown ? (
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
            )}
          </>
        ),
      })}

      {state.consideredAthleteDeletion.match({
        none: () => null,
        some: deletion =>
          deletion.isDeletable ? (
            <div>
              <h3>Confirm athlete deletion</h3>
              <p>
                Are you sure you want to delete {deletion.athlete.firstName}{" "}
                {deletion.athlete.lastName} (#{deletion.athlete.id})?
              </p>
              <p>This action will be irreversible.</p>
              <button onClick={controller.cancelAthleteDeletion}>Cancel</button>
              <button onClick={controller.confirmAthleteDeletion}>
                Delete
              </button>
            </div>
          ) : (
            <div>
              <h3>Cannot delete athlete</h3>
              <p>
                This athlete ({deletion.athlete.firstName}{" "}
                {deletion.athlete.lastName}) has finished one or more meets this
                season. To delete this athlete from the season, you must first
                delete the athlete from all the meets{" "}
                {getGenderSubjectPronoun(deletion.athlete.gender)} finished in.
              </p>
              <button onClick={controller.cancelAthleteDeletion}>Ok</button>
            </div>
          ),
      })}
    </div>
  );
}

interface Props {
  state: AthletesMenuState;
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
