import {
  EditableAthleteField,
  HypotheticalAthlete,
  PendingHypotheticalAthleteEdit,
  Gender,
  isGender,
} from "./types/misc";
import Option from "./types/Option";
import { HUMAN_NAME } from "./consts";

export default function updateAthleteRowsIfPendingEditIsValid(
  rows: HypotheticalAthlete[],
  pendingEdit: PendingHypotheticalAthleteEdit
): HypotheticalAthlete[] {
  if (isPendingEditValid(pendingEdit)) {
    return rows.map((row, i) =>
      i === pendingEdit.athleteIndex ? updateAthleteRow(row, pendingEdit) : row
    );
  } else {
    return rows;
  }
}

function isPendingEditValid(edit: PendingHypotheticalAthleteEdit): boolean {
  switch (edit.editedField) {
    case EditableAthleteField.FirstName:
    case EditableAthleteField.LastName:
      return HUMAN_NAME.test(edit.fieldValue);
    case EditableAthleteField.Grade:
      return !isNaN(parseInt(edit.fieldValue, 10));
    case EditableAthleteField.Gender:
      return isGender(edit.fieldValue);
    case EditableAthleteField.School:
      return true;
  }
}

function updateAthleteRow(
  row: HypotheticalAthlete,
  pendingEdit: PendingHypotheticalAthleteEdit
): HypotheticalAthlete {
  switch (pendingEdit.editedField) {
    case EditableAthleteField.FirstName:
      return { ...row, firstName: pendingEdit.fieldValue };
    case EditableAthleteField.LastName:
      return { ...row, lastName: pendingEdit.fieldValue };
    case EditableAthleteField.Grade: {
      const gradeOrNaN = parseInt(pendingEdit.fieldValue, 10);
      const grade: Option<number> = isNaN(gradeOrNaN)
        ? Option.none()
        : Option.some(gradeOrNaN);
      return { ...row, grade };
    }
    case EditableAthleteField.Gender: {
      const gender: Option<Gender> = (() => {
        if (pendingEdit.fieldValue === Gender.Male) {
          return Option.some(Gender.Male);
        } else if (pendingEdit.fieldValue === Gender.Female) {
          return Option.some(Gender.Female);
        } else {
          return Option.none() as Option<Gender>;
        }
      })();
      return { ...row, gender };
    }
    case EditableAthleteField.School: {
      const school: Option<string> =
        pendingEdit.fieldValue === ""
          ? Option.none()
          : Option.some(pendingEdit.fieldValue);
      return { ...row, school };
    }
  }
}
