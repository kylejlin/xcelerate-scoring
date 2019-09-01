import {
  Athlete,
  AthleteField,
  Gender,
  PendingAthleteEdit,
} from "./types/misc";

export default function updateAthletes(
  athletes: Athlete[],
  edit: PendingAthleteEdit
): Athlete[] {
  return athletes.map(athlete =>
    athlete.id === edit.athleteId ? updateAthlete(athlete, edit) : athlete
  );
}

function updateAthlete(athlete: Athlete, edit: PendingAthleteEdit): Athlete {
  switch (edit.editedField) {
    case AthleteField.FirstName:
      return { ...athlete, firstName: edit.fieldValue };
    case AthleteField.LastName:
      return { ...athlete, lastName: edit.fieldValue };
    case AthleteField.Grade:
      return { ...athlete, grade: parseInt(edit.fieldValue, 10) };
    case AthleteField.Gender:
      return { ...athlete, gender: edit.fieldValue as Gender };
    case AthleteField.School:
      return { ...athlete, school: edit.fieldValue };
  }
}
