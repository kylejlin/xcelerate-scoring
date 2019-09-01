import { Athlete, AthleteField } from "./types/misc";

export default function getAthleteFieldValue(
  athlete: Athlete,
  field: AthleteField
): string {
  switch (field) {
    case AthleteField.FirstName:
      return athlete.firstName;
    case AthleteField.LastName:
      return athlete.lastName;
    case AthleteField.Grade:
      return "" + athlete.grade;
    case AthleteField.Gender:
      return athlete.gender;
    case AthleteField.School:
      return athlete.school;
  }
}
