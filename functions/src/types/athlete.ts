import { isNonNegativeInt } from "./misc";
import { Teams, getOrderedTeams } from "./team";
import Option from "./Option";

export interface UnidentifiedAthlete {
  firstName: string;
  lastName: string;
  grade: number;
  gender: Gender;
  school: string;
}

export interface Athlete extends UnidentifiedAthlete {
  id: number;
}

export enum Gender {
  Male = "M",
  Female = "F",
}

export function isGender(x: unknown): x is Gender {
  return x === "M" || x === "F";
}

// [orderedTeamIndex, firstName, lastName]
export type CompressedUnidentifiedAthlete = [number, string, string];

export function decompressUnidentifiedAthlete(
  athlete: CompressedUnidentifiedAthlete,
  teams: Teams
): Option<UnidentifiedAthlete> {
  const orderedTeams = getOrderedTeams(teams);
  const [teamIndex, firstName, lastName] = athlete;
  const team = orderedTeams[teamIndex];
  if (team === undefined) {
    return Option.none();
  } else {
    return Option.some({ firstName, lastName, ...team });
  }
}

export function isCompressedUnidentifiedAthlete(
  x: unknown
): x is CompressedUnidentifiedAthlete {
  return (
    Array.isArray(x) &&
    x.length === 3 &&
    isNonNegativeInt(x[0]) &&
    "string" === typeof x[1] &&
    "string" === typeof x[2]
  );
}

// [id, orderedTeamIndex, firstName, lastName]
export type CompressedAthlete = [number, number, string, string];

export function decompressAthlete(
  athlete: CompressedAthlete,
  teams: Teams
): Option<Athlete> {
  const orderedTeams = getOrderedTeams(teams);
  const [id, teamIndex, firstName, lastName] = athlete;
  const team = orderedTeams[teamIndex];
  if (team === undefined) {
    return Option.none();
  } else {
    return Option.some({ id, firstName, lastName, ...team });
  }
}

export function isCompressedAthlete(x: unknown): x is CompressedAthlete {
  return (
    Array.isArray(x) &&
    x.length === 4 &&
    isNonNegativeInt(x[0]) &&
    isNonNegativeInt(x[1]) &&
    "string" === typeof x[2] &&
    "string" === typeof x[3]
  );
}
