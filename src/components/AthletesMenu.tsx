import React from "react";

import { AthletesMenuState } from "../types/states";
import { AthletesMenuController } from "../types/controllers";
import { Athlete, AthleteField, AthleteFilter, Gender } from "../types/misc";
import inclusiveIntRange from "../inclusiveIntRange";

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
      {state.athleteFilterOptions.match({
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

      {state.athletes.match({
        none: () => <p>Loading athletes...</p>,
        some: athletes => (
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
                  <td>{athlete.id}</td>
                  <td>
                    {idOfEditedAthlete === athlete.id &&
                    editedField === AthleteField.FirstName ? (
                      <input
                        type="text"
                        value={fieldValue}
                        onChange={controller.editSelectedAthleteField}
                        onBlur={controller.syncAndUnfocusEditedAthleteField}
                      />
                    ) : (
                      <span
                        onClick={() =>
                          controller.selectAthleteFieldToEdit(
                            athlete.id,
                            AthleteField.FirstName
                          )
                        }
                      >
                        {athlete.firstName}
                      </span>
                    )}
                  </td>
                  <td>
                    {idOfEditedAthlete === athlete.id &&
                    editedField === AthleteField.LastName ? (
                      <input
                        type="text"
                        value={fieldValue}
                        onChange={controller.editSelectedAthleteField}
                        onBlur={controller.syncAndUnfocusEditedAthleteField}
                      />
                    ) : (
                      <span
                        onClick={() =>
                          controller.selectAthleteFieldToEdit(
                            athlete.id,
                            AthleteField.LastName
                          )
                        }
                      >
                        {athlete.lastName}
                      </span>
                    )}
                  </td>
                  <td>
                    {idOfEditedAthlete === athlete.id &&
                    editedField === AthleteField.Grade ? (
                      state.athleteFilterOptions.match({
                        none: () => <p>Loading eligible grades...</p>,
                        some: filterOptions => (
                          <select
                            value={fieldValue}
                            onChange={controller.editSelectedAthleteField}
                            onBlur={controller.syncAndUnfocusEditedAthleteField}
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
                          controller.selectAthleteFieldToEdit(
                            athlete.id,
                            AthleteField.Grade
                          )
                        }
                      >
                        {athlete.grade}
                      </span>
                    )}
                  </td>
                  <td>
                    {idOfEditedAthlete === athlete.id &&
                    editedField === AthleteField.Gender ? (
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
                          controller.selectAthleteFieldToEdit(
                            athlete.id,
                            AthleteField.Gender
                          )
                        }
                      >
                        {athlete.gender}
                      </span>
                    )}
                  </td>
                  <td>
                    {idOfEditedAthlete === athlete.id &&
                    editedField === AthleteField.School ? (
                      state.athleteFilterOptions.match({
                        none: () => <p>Loading schools...</p>,
                        some: filterOptions => (
                          <select
                            value={fieldValue}
                            onChange={controller.editSelectedAthleteField}
                            onBlur={controller.syncAndUnfocusEditedAthleteField}
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
                          controller.selectAthleteFieldToEdit(
                            athlete.id,
                            AthleteField.School
                          )
                        }
                      >
                        {athlete.school}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        controller.considerAthleteForDeletion(athlete)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ),
      })}

      {state.athleteConsideredForDeletion.match({
        none: () => null,
        some: athlete => (
          <div>
            <h3>Confirm athlete deletion</h3>
            <p>
              Are you sure you want to delete {athlete.firstName}{" "}
              {athlete.lastName}{" "}
              <span className="TempStyleItalic">(#{athlete.id})</span>?
            </p>
            <p>This action will be irreversible.</p>
            <button onClick={controller.cancelAthleteDeletion}>Cancel</button>
            <button onClick={controller.confirmAthleteDeletion}>Delete</button>
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
