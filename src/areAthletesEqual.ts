import { Athlete } from "./types/misc";

export default function areAthletesEqual(a: Athlete, b: Athlete): boolean {
  return (
    a.id === b.id &&
    a.firstName === b.firstName &&
    a.lastName === b.lastName &&
    a.school === b.school &&
    a.grade === b.grade &&
    a.gender === b.gender
  );
}
