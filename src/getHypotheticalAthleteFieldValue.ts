import { EditableAthleteField, HypotheticalAthlete } from "./types/misc";

export default function getHypotheticalAthleteFieldValue(
  athlete: HypotheticalAthlete,
  field: EditableAthleteField
): string {
  switch (field) {
    case EditableAthleteField.FirstName:
      return athlete.firstName;
    case EditableAthleteField.LastName:
      return athlete.lastName;
    case EditableAthleteField.Grade:
      return athlete.grade.map(g => "" + g).unwrapOr("");
    case EditableAthleteField.Gender:
      return athlete.gender.unwrapOr("");
    case EditableAthleteField.School:
      return athlete.school.unwrapOr("");
  }
}
