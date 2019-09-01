import { AthleteField, AthleteRow, AthleteRowField } from "./types/misc";

export default function getAthleteRowFieldValue(
  athleteRow: AthleteRow,
  field: AthleteRowField
): string {
  switch (field) {
    case AthleteField.FirstName:
      return athleteRow.firstName;
    case AthleteField.LastName:
      return athleteRow.lastName;
    case AthleteField.Grade:
      return athleteRow.grade.map(g => "" + g).unwrapOr("");
    case AthleteField.Gender:
      return athleteRow.gender.unwrapOr("");
  }
}
