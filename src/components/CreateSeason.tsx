import React from "react";

import { CreateSeasonState } from "../types/states";
import { CreateSeasonController } from "../types/controllers";

export default function CreateSeason({
  state,
  controller,
}: Props): React.ReactElement {
  return (
    <div className="App">
      <button onClick={controller.navigateToUserSeasonsScreen}>Cancel</button>
      <label>
        Name:{" "}
        <input
          type="text"
          value={state.seasonName}
          onChange={controller.editSeasonName}
        />
      </label>
      <label>
        Minimum grade:{" "}
        <input
          type="text"
          value={state.minGrade}
          onChange={controller.editPendingMinGrade}
          onBlur={controller.validatePendingGrades}
        />
      </label>
      <label>
        Maximum grade:{" "}
        <input
          type="text"
          value={state.maxGrade}
          onChange={controller.editPendingMaxGrade}
          onBlur={controller.validatePendingGrades}
        />
      </label>
      <ul>
        {state.schools.map(school => (
          <li key={school}>
            {school}{" "}
            <button onClick={() => controller.deleteSchool(school)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <label>
        Add school:{" "}
        <input
          type="text"
          value={state.newSchoolName}
          onChange={controller.editNewSchoolName}
        />
        <button onClick={controller.addNewSchool}>Add</button>
      </label>
      {state.isCreatingSeason ? (
        <p>Creating season...</p>
      ) : (
        <button onClick={controller.createSeason}>Create season</button>
      )}
    </div>
  );
}

interface Props {
  state: CreateSeasonState;
  controller: CreateSeasonController;
}
