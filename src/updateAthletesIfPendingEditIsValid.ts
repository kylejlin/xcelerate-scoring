import {
  Athlete,
  EditableAthleteField,
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

function updateAthlete(athlete: Athlete, edit: PendingAthleteEdit): Athlete {
  switch (edit.editedField) {
    case EditableAthleteField.FirstName:
      return { ...athlete, firstName: edit.fieldValue };
    case EditableAthleteField.LastName:
      return { ...athlete, lastName: edit.fieldValue };
    case EditableAthleteField.Grade:
      return { ...athlete, grade: parseInt(edit.fieldValue, 10) };
    case EditableAthleteField.Gender:
      return { ...athlete, gender: edit.fieldValue as Gender };
    case EditableAthleteField.School:
      return { ...athlete, school: edit.fieldValue };
  }
}
