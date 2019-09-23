import firebase from "../firebase";

import { Athlete, Teams } from "../types/misc";
import Option from "../types/Option";
import { RaceDivisionUtil } from "../types/race";

const db = firebase.firestore();

export default function openSeasonAthletesHandleUntil(
  seasonId: string,
  waitForStopListeningSignal: Promise<void>
): {
  raceDivisions: Promise<Teams>;
  athletes: {
    onUpdate(listener: (athletes: Athlete[]) => void): void;
  };
} {
  const listeners: ((athletes: Athlete[]) => void)[] = [];
  let resolveRaceDivisions: ((divisions: Teams) => void) | null = null;
  const raceDivisions: Promise<Teams> = new Promise(resolve => {
    resolveRaceDivisions = resolve;
  });
  const stopListening = db
    .collection("seasonAthleteAggregates")
    .doc(seasonId)
    .onSnapshot(doc => {
      const data = doc.data();
      console.log("aggregate data", data);
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
): Option<Teams> {
  const { payload } = data;
  if (Array.isArray(payload)) {
    const [minGrade, maxGrade, numberOfSchools, ...rest] = payload;
    if (
      isPositiveInt(minGrade) &&
      isPositiveInt(maxGrade) &&
      minGrade <= maxGrade &&
      isNonNegativeInt(numberOfSchools)
    ) {
      const schools = rest.slice(0, numberOfSchools);
      if (schools.length === numberOfSchools) {
        return Option.some({ minGrade, maxGrade, schools });
      }
    }
  }
  console.log("cannot get race div");
  return Option.none();
}

function parseAggregate(
  data: firebase.firestore.DocumentData
): Option<Athlete[]> {
  const { payload } = data;
  if (Array.isArray(payload)) {
    const [minGrade, maxGrade, numberOfSchools, ...rest] = payload;
    if (
      isPositiveInt(minGrade) &&
      isPositiveInt(maxGrade) &&
      minGrade <= maxGrade &&
      isNonNegativeInt(numberOfSchools)
    ) {
      const schools = rest.slice(0, numberOfSchools);
      if (schools.length === numberOfSchools) {
        const athleteIdsAndNamesFlat2dList = rest.slice(numberOfSchools);
        const athleteIdsAndNames = parseFlat2dList(
          athleteIdsAndNamesFlat2dList
        );
        return athleteIdsAndNames.andThen(athleteIdsAndNames => {
          if (isValidAthleteIdsAndNames(athleteIdsAndNames)) {
            const orderedSchools = schools.sort();
            const divisions = RaceDivisionUtil.DEPRECATED_getDivisions({
              min: minGrade,
              max: maxGrade,
            });
            const athletes: Athlete[] = [];
            orderedSchools.forEach((school, schoolIndex) => {
              divisions.forEach((division, divisionIndex) => {
                const athleteIdsAndNamesInThisSchoolAndDivision =
                  athleteIdsAndNames[
                    schoolIndex * divisions.length + divisionIndex
                  ];
                for (
                  let i = 0;
                  i < athleteIdsAndNamesInThisSchoolAndDivision.length;
                  i += 3
                ) {
                  athletes.push({
                    id: zeroPadToFiveDigits(
                      athleteIdsAndNamesInThisSchoolAndDivision[i] as number
                    ),
                    firstName: athleteIdsAndNamesInThisSchoolAndDivision[
                      i + 1
                    ] as string,
                    lastName: athleteIdsAndNamesInThisSchoolAndDivision[
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
            console.log("invalid athleteIdsAndNames", athleteIdsAndNames);
            return Option.none();
          }
        });
      }
    }
  }

  console.log("something else went wrong");
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
