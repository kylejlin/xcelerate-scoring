import { AthleteRow } from "./types/misc";

export default function areAthleteRowsValid(athletes: AthleteRow[]): boolean {
  return athletes.every(
    athlete =>
      athlete.firstName !== "" &&
      athlete.lastName !== "" &&
      athlete.grade.isSome() &&
      athlete.gender.isSome()
  );
}
