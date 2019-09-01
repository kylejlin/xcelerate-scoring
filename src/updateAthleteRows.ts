import {
  AthleteField,
  AthleteRow,
  PendingAthleteRowEdit,
  Gender,
} from "./types/misc";
import Option from "./types/Option";

export default function updateAthleteRows(
  rows: AthleteRow[],
  pendingEdit: PendingAthleteRowEdit
): AthleteRow[] {
  return rows.map((row, i) =>
    i === pendingEdit.athleteIndex ? updateAthleteRow(row, pendingEdit) : row
  );
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
