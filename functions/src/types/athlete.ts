import { isNonNegativeInt } from "./misc";
import { Teams, getOrderedTeams } from "./team";
import Option from "./Option";

export interface Athlete extends HypotheticalAthlete {
  id: string;
}

export interface HypotheticalAthlete {
  firstName: string;
  lastName: string;
  grade: number;
  gender: Gender;
  school: string;
}

export type CompressedHypotheticalAthlete = [number, string, string];

export function decompressHypotheticalAthlete(
  athlete: CompressedHypotheticalAthlete,
  teams: Teams
): Option<HypotheticalAthlete> {
  const orderedTeams = getOrderedTeams(teams);
  const [teamIndex, firstName, lastName] = athlete;
  const team = orderedTeams[teamIndex];
  if (team === undefined) {
    return Option.none();
  } else {
    return Option.some({ firstName, lastName, ...team });
  }
}

export function isCompressedHypotheticalAthlete(
  x: unknown
): x is CompressedHypotheticalAthlete {
  return (
    Array.isArray(x) &&
    x.length === 3 &&
    isNonNegativeInt(x[0]) &&
    "string" === typeof x[1] &&
    "string" === typeof x[2]
  );
}

export enum Gender {
  Male = "M",
  Female = "F",
}

export function isGender(x: unknown): x is Gender {
  return x === "M" || x === "F";
}
