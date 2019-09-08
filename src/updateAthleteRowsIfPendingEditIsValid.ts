import {
  AthleteField,
  AthleteRow,
  PendingAthleteRowEdit,
  Gender,
  isGender,
} from "./types/misc";
import Option from "./types/Option";
import { HUMAN_NAME } from "./consts";

export default function updateAthleteRowsIfPendingEditIsValid(
  rows: AthleteRow[],
  pendingEdit: PendingAthleteRowEdit
): AthleteRow[] {
  if (isPendingEditValid(pendingEdit)) {
    return rows.map((row, i) =>
      i === pendingEdit.athleteIndex ? updateAthleteRow(row, pendingEdit) : row
    );
  } else {
    return rows;
  }
}

function isPendingEditValid(edit: PendingAthleteRowEdit): boolean {
  switch (edit.editedField) {
    case AthleteField.FirstName:
    case AthleteField.LastName:
      return HUMAN_NAME.test(edit.fieldValue);
    case AthleteField.Grade:
      return !isNaN(parseInt(edit.fieldValue, 10));
    case AthleteField.Gender:
      return isGender(edit.fieldValue);
  }
}

function updateAthleteRow(
  row: AthleteRow,
  pendingEdit: PendingAthleteRowEdit
): AthleteRow {
  switch (pendingEdit.editedField) {
    case AthleteField.FirstName:
      return { ...row, firstName: pendingEdit.fieldValue };
    case AthleteField.LastName:
      return { ...row, lastName: pendingEdit.fieldValue };
    case AthleteField.Grade: {
      const gradeOrNaN = parseInt(pendingEdit.fieldValue, 10);
      const grade: Option<number> = isNaN(gradeOrNaN)
        ? Option.none()
        : Option.some(gradeOrNaN);
      return { ...row, grade };
    }
    case AthleteField.Gender: {
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
  }
}
