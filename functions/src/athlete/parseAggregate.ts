import * as admin from "firebase-admin";

import { Aggregate, Athlete } from "./types";
import Option from "../types/Option";
import { getOrderedTeams, TeamsRecipe } from "../types/team";

export default function parseAggregate(
  data: admin.firestore.DocumentData
): Option<Aggregate> {
  const { lowestAvailableAthleteId, payload } = data;
  if (isNonNegativeInt(lowestAvailableAthleteId) && Array.isArray(payload)) {
    const [minGrade, maxGrade, numberOfSchools, ...rest] = payload;
    if (
      isPositiveInt(minGrade) &&
      isPositiveInt(maxGrade) &&
      minGrade <= maxGrade &&
      isNonNegativeInt(numberOfSchools)
    ) {
      const schools = rest.slice(0, numberOfSchools);
      const teams: TeamsRecipe = { minGrade, maxGrade, schools };
      if (schools.length === numberOfSchools) {
        const athleteIdsAndNamesFlat2dList = rest.slice(numberOfSchools);
        const optAthleteIdsAndNames = parseFlat2dList(
          athleteIdsAndNamesFlat2dList
        );
        return optAthleteIdsAndNames.andThen(athleteIdsAndNames => {
          if (isValidAthleteIdsAndNames(athleteIdsAndNames)) {
            const orderedTeams = getOrderedTeams(teams);
            const athletes: Athlete[] = [];
            orderedTeams.forEach((team, teamIndex) => {
              const athleteIdsAndNamesInThisSchoolAndDivision =
                athleteIdsAndNames[teamIndex];
              for (
                let i = 0;
                i < athleteIdsAndNamesInThisSchoolAndDivision.length;
                i += 3
              ) {
                athletes.push({
                  id: athleteIdsAndNamesInThisSchoolAndDivision[i] as number,
                  firstName: athleteIdsAndNamesInThisSchoolAndDivision[
                    i + 1
                  ] as string,
                  lastName: athleteIdsAndNamesInThisSchoolAndDivision[
                    i + 2
                  ] as string,
                  ...team,
                });
              }
            });
            return Option.some({
              lowestAvailableAthleteId,
              teams,
              athletes,
            });
          } else {
            return Option.none();
          }
        });
      }
    }
  }

  return Option.none();
}

function isPositiveInt(n: unknown): n is number {
  return isInt(n) && n > 0;
}

function isNonNegativeInt(n: unknown): n is number {
  return isInt(n) && n >= 0;
}

function isInt(n: unknown): n is number {
  return n === parseInt("" + n, 10);
}

function parseFlat2dList(arr: unknown[]): Option<any[][]> {
  const parsed = [];
  let cursor = 0;
  while (cursor < arr.length) {
    const subArrLen = arr[cursor];
    if (!isNonNegativeInt(subArrLen)) {
      return Option.none();
    }
    cursor++;
    if (cursor + subArrLen > arr.length) {
      return Option.none();
    }
    parsed.push(arr.slice(cursor, cursor + subArrLen));
    cursor += subArrLen;
  }
  return Option.some(parsed);
}

function isValidAthleteIdsAndNames(x: unknown): x is (number | string)[][] {
  return (
    Array.isArray(x) &&
    x.every(
      y =>
        Array.isArray(y) &&
        y.length % 3 === 0 &&
        y.every((z, i) => (i % 3 === 0 ? isInt(z) : "string" === typeof z))
    )
  );
}
