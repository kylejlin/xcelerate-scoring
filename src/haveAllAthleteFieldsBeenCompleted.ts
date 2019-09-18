import { TentativeHypotheticalAthlete } from "./types/misc";
import { HUMAN_NAME } from "./consts";

export default function haveAllAthleteFieldsBeenCompleted(
  athletes: TentativeHypotheticalAthlete[]
): boolean {
  return athletes.every(
    athlete =>
      HUMAN_NAME.test(athlete.firstName) &&
      HUMAN_NAME.test(athlete.lastName) &&
      athlete.grade.isSome() &&
      athlete.gender.isSome() &&
      athlete.school.isSome()
  );
}
