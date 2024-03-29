import { Athlete, EditableAthleteField } from "./types/misc";

export default function getAthleteFieldValue(
  athlete: Athlete,
  field: EditableAthleteField
): string {
  switch (field) {
    case EditableAthleteField.FirstName:
      return athlete.firstName;
    case EditableAthleteField.LastName:
      return athlete.lastName;
    case EditableAthleteField.Grade:
      return "" + athlete.grade;
    case EditableAthleteField.Gender:
      return athlete.gender;
    case EditableAthleteField.School:
      return athlete.school;
  }
}
