import firebase from "../firebase";

import { Athlete, RaceDivisions } from "../types/misc";
import Option from "../types/Option";
import { RaceDivisionUtil } from "../types/race";

const db = firebase.firestore();

export default function openSeasonAthletesHandleUntil(
  seasonId: string,
  waitForStopListeningSignal: Promise<void>
): {
  raceDivisions: Promise<RaceDivisions>;
  athletes: {
    onUpdate(listener: (athletes: Athlete[]) => void): void;
  };
} {
  const listeners: ((athletes: Athlete[]) => void)[] = [];
  let resolveRaceDivisions: ((divisions: RaceDivisions) => void) | null = null;
  const raceDivisions: Promise<RaceDivisions> = new Promise(resolve => {
    resolveRaceDivisions = resolve;
  });
  const stopListening = db
    .collection("seasonAthleteAggregates")
    .doc(seasonId)
    .onSnapshot(doc => {
      const data = doc.data();
      if (data === undefined) {
        stopListening();
        throw new Error(
          "Attempted to call observeSeasonAthletesUntil on a season without an athletes aggregate."
        );
      } else {
        if (resolveRaceDivisions !== null) {
          resolveRaceDivisions(
            getAggregateRaceDivisions(data).expect("Malformed aggregate.")
          );
          resolveRaceDivisions = null;
        }
        const athletes = parseAggregate(data).expect("Malformed aggregate.");
        listeners.forEach(f => {
          f(athletes);
        });
      }
    });
  waitForStopListeningSignal.then(stopListening);
  return {
    raceDivisions,
    athletes: {
      onUpdate(listener: (athletes: Athlete[]) => void) {
        listeners.push(listener);
      },
    },
  };
}

function getAggregateRaceDivisions(
  data: firebase.firestore.DocumentData
): Option<RaceDivisions> {
  const { payload } = data;
  if (Array.isArray(payload)) {
    const [minGrade, maxGrade, schools] = payload;
    if (
      isPositiveInt(minGrade) &&
      isPositiveInt(maxGrade) &&
      minGrade <= maxGrade &&
      isStringArray(schools)
    ) {
      return Option.some({ minGrade, maxGrade, schools });
    } else {
      return Option.none();
    }
  } else {
    return Option.none();
  }
}

function parseAggregate(
  data: firebase.firestore.DocumentData
): Option<Athlete[]> {
  const { payload } = data;
  if (Array.isArray(payload)) {
    const [minGrade, maxGrade, schools, athleteIdsAndNames] = payload;
    if (
      isPositiveInt(minGrade) &&
      isPositiveInt(maxGrade) &&
      minGrade <= maxGrade &&
      isStringArray(schools) &&
      isValidAthleteIdsAndNames(athleteIdsAndNames)
    ) {
      const athletes: Athlete[] = [];
      const orderedSchools = schools.sort();
      const divisions = RaceDivisionUtil.getDivisions({
        min: minGrade,
        max: maxGrade,
      });
      orderedSchools.forEach((school, schoolIndex) => {
        divisions.forEach((division, divisionIndex) => {
          const idsAndNamesOfAthletesInThisSchoolAndDivision =
            athleteIdsAndNames[schoolIndex * divisions.length + divisionIndex];
          for (
            let i = 0;
            i < idsAndNamesOfAthletesInThisSchoolAndDivision.length;
            i += 3
          ) {
            athletes.push({
              id: zeroPadToFiveDigits(
                idsAndNamesOfAthletesInThisSchoolAndDivision[i] as number
              ),
              firstName: idsAndNamesOfAthletesInThisSchoolAndDivision[
                i + 1
              ] as string,
              lastName: idsAndNamesOfAthletesInThisSchoolAndDivision[
                i + 2
              ] as string,
              grade: division.grade,
              gender: division.gender,
              school,
            });
          }
        });
      });
      return Option.some(athletes);
    } else {
      return Option.none();
    }
  } else {
    return Option.none();
  }
}

function isPositiveInt(n: unknown): n is number {
  return isInt(n) && n > 0;
}

function isInt(n: unknown): n is number {
  return n === parseInt("" + n, 10);
}

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every(y => "string" === typeof y);
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

// TODO DRY
// Duplicates function in addAthletesToSeason.ts
function zeroPadToFiveDigits(number: number): string {
  const str = number.toString();
  if (str.length <= 5) {
    const missingDigits = 5 - str.length;
    return "0".repeat(missingDigits) + str;
  } else {
    throw new Error(
      "Attempted to zeroPadToFiveDigits a number that was " +
        str.length +
        " digits."
    );
  }
}
