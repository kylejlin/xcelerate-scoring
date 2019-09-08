import React from "react";

import { CorrectPastedAthletesState } from "../types/states";
import { CorrectPastedAthletesController } from "../types/controllers";
import { AthleteField, Gender } from "../types/misc";
import areAthleteRowsValid from "../areAthleteRowsValid";
import inclusiveIntRange from "../inclusiveIntRange";

const MISSING_FIELD_PLACEHOLDER = <span className="TempMissingField">?</span>;

export default function CorrectPastedAthletes({
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
      <button onClick={() => controller.navigateToAthletesMenu}>Back</button>
      <h2>{state.seasonSummary.name} - Corrected pasted athletes</h2>
      <button onClick={controller.swapFirstAndLastNames}>
        Swap first and last names
      </button>
      <table>
        <tbody>
          <tr>
            <th>Grade</th>
            <th>First</th>
            <th>Last</th>
            <th>Gender</th>
          </tr>
          {state.athletes.map((athlete, i) => {
            const [editedField, fieldValue] = state.pendingAthleteEdit.match({
              none: () => [null, ""],
              some: edit =>
                edit.athleteIndex === i
                  ? [edit.editedField, edit.fieldValue]
                  : [null, ""],
            });
            return (
              <tr
                key={
                  athlete.grade.unwrapOr("") +
                  athlete.firstName +
                  athlete.lastName
                }
              >
                <td>
                  {editedField === AthleteField.Grade ? (
                    state.gradeBounds.match({
                      none: () => <p>Loading allowed grades...</p>,
                      some: gradeBounds => (
                        <select
                          value={fieldValue}
                          onChange={controller.editSelectedAthleteField}
                        >
                          {fieldValue === "" && <option value="">?</option>}
                          {inclusiveIntRange(gradeBounds.min, gradeBounds.max)
                            .map(grade => "" + grade)
                            .map(grade => (
                              <option value={grade}>{grade}</option>
                            ))}
                        </select>
                      ),
                    })
                  ) : (
                    <span
                      onClick={() =>
                        controller.selectAthleteFieldToEdit(
                          i,
                          AthleteField.Grade
                        )
                      }
                    >
                      {athlete.grade.unwrapOr(MISSING_FIELD_PLACEHOLDER)}
                    </span>
                  )}
                </td>
                <td>
                  {editedField === AthleteField.FirstName ? (
                    <input
                      value={fieldValue}
                      onChange={controller.editSelectedAthleteField}
                      onBlur={controller.syncAndUnfocusEditedAthleteField}
                    />
                  ) : (
                    <span
                      onClick={() =>
                        controller.selectAthleteFieldToEdit(
                          i,
                          AthleteField.FirstName
                        )
                      }
                    >
                      {athlete.firstName === ""
                        ? MISSING_FIELD_PLACEHOLDER
                        : athlete.firstName}
                    </span>
                  )}
                </td>
                <td>
                  {editedField === AthleteField.LastName ? (
                    <input
                      value={fieldValue}
                      onChange={controller.editSelectedAthleteField}
                      onBlur={controller.syncAndUnfocusEditedAthleteField}
                    />
                  ) : (
                    <span
                      onClick={() =>
                        controller.selectAthleteFieldToEdit(
                          i,
                          AthleteField.LastName
                        )
                      }
                    >
                      {athlete.lastName === ""
                        ? MISSING_FIELD_PLACEHOLDER
                        : athlete.lastName}
                    </span>
                  )}
                </td>
                <td>
                  {editedField === AthleteField.Gender ? (
                    <select
                      value={fieldValue}
                      onChange={controller.editSelectedAthleteField}
                    >
                      {fieldValue === "" && <option value="">?</option>}
                      <option value={Gender.Male}>M</option>
                      <option value={Gender.Female}>F</option>
                    </select>
                  ) : (
                    <span
                      onClick={() =>
                        controller.selectAthleteFieldToEdit(
                          i,
                          AthleteField.Gender
                        )
                      }
                    >
                      {athlete.gender.unwrapOr(MISSING_FIELD_PLACEHOLDER)}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {areAthleteRowsValid(state.athletes) ? (
        <button onClick={controller.addAthletes}>Add athletes</button>
      ) : (
        <p>You need to fill in the missing fields.</p>
      )}
    </div>
  );
}

interface Props {
  state: CorrectPastedAthletesState;
  controller: CorrectPastedAthletesController;
}
