import {
  Athlete,
  AthleteField,
  Gender,
  PendingAthleteEdit,
  isGender,
} from "./types/misc";
import { HUMAN_NAME } from "./consts";

export default function updateAthletesIfPendingEditIsValid(
  athletes: Athlete[],
  edit: PendingAthleteEdit
): Athlete[] {
  if (isPendingEditValid(edit)) {
    return athletes.map(athlete =>
      athlete.id === edit.athleteId ? updateAthlete(athlete, edit) : athlete
    );
  } else {
    return athletes;
  }
}

function isPendingEditValid(edit: PendingAthleteEdit): boolean {
  switch (edit.editedField) {
    case AthleteField.FirstName:
    case AthleteField.LastName:
      return HUMAN_NAME.test(edit.fieldValue);
    case AthleteField.Grade:
      return !isNaN(parseInt(edit.fieldValue, 10));
    case AthleteField.Gender:
      return isGender(edit.fieldValue);
    case AthleteField.School:
      return true;
  }
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
