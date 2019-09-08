import Option from "./Option";
import { Athlete } from "./misc";

export interface RaceResults {
  athleteTeamPlaces: { [athleteId: string]: Option<number> };
  schoolResults: SchoolResult[];
}

export interface SchoolResult {
  place: number;
  school: string;
  points: number;
}

export default function scoreRace(athletes: Athlete[]): RaceResults {
  let teamPlaceCounter = 1;
  const schools = removeDuplicates(athletes.map(a => a.school));
  const schoolAthleteCount = getDictPopulatedWithZeros(schools);
  const schoolPointCount = getDictPopulatedWithZeros(schools);
  const athleteTeamPlaces = getDictPopulatedWithNones<number>(
    athletes.map(a => a.id)
  );
  const schoolSixthAthleteTeamPlace = getDictPopulatedWithNones<number>(
    schools
  );

  athletes.forEach(athlete => {
    schoolAthleteCount[athlete.school] += 1;
    if (schoolAthleteCount[athlete.school] <= 5) {
      schoolPointCount[athlete.school] += teamPlaceCounter;

      athleteTeamPlaces[athlete.id] = Option.some(teamPlaceCounter);
      teamPlaceCounter++;
    } else if (schoolAthleteCount[athlete.school] <= 7) {
      if (schoolAthleteCount[athlete.school] === 6) {
        schoolSixthAthleteTeamPlace[athlete.school] = Option.some(
          teamPlaceCounter
        );
      }
      athleteTeamPlaces[athlete.id] = Option.some(teamPlaceCounter);
      teamPlaceCounter++;
    }
  });

  const scoringData = compileScoringData(
    schools,
    schoolAthleteCount,
    schoolPointCount,
    schoolSixthAthleteTeamPlace
  );
  const schoolResults = placeSchools(scoringData);
  return { athleteTeamPlaces, schoolResults };
}

function removeDuplicates<T>(arr: T[]): T[] {
  const uniqueItems: T[] = [];
  arr.forEach(item => {
    if (!uniqueItems.includes(item)) {
      uniqueItems.push(item);
    }
  });
  return uniqueItems;
}

function getDictPopulatedWithZeros(keys: string[]): { [key: string]: number } {
  const dict: { [key: string]: 0 } = {};
  keys.forEach(key => {
    dict[key] = 0;
  });
  return dict;
}

function getDictPopulatedWithNones<T>(
  keys: string[]
): { [athleteId: string]: Option<T> } {
  const dict: { [key: string]: Option<T> } = {};
  keys.forEach(key => {
    dict[key] = Option.none();
  });
  return dict;
}

interface SchoolScoringData {
  school: string;
  athletes: number;
  points: number;
  sixthAthleteTeamPlace: Option<number>;
}

function compileScoringData(
  schools: string[],
  schoolAthleteCount: { [school: string]: number },
  schoolPointCount: { [school: string]: number },
  schoolSixthAthleteTeamPlace: { [school: string]: Option<number> }
): SchoolScoringData[] {
  return schools.map(school => ({
    school,
    athletes: schoolAthleteCount[school],
    points: schoolPointCount[school],
    sixthAthleteTeamPlace: schoolSixthAthleteTeamPlace[school],
  }));
}

function placeSchools(scoringData: SchoolScoringData[]): SchoolResult[] {
  const sorter = prioritizeSorters(
    sortDescByAthleteCountCappedAtFive,
    sortAscByPoints,
    sortAscBySixthAthleteTeamPlace
  );
  return scoringData
    .slice()
    .sort(sorter)
    .map((scoringData, i, allData) => {
      let placeStartingAtZero = i;
      while (
        placeStartingAtZero > 0 &&
        areValuesEqual(
          allData[placeStartingAtZero],
          allData[placeStartingAtZero - 1],
          sorter
        )
      ) {
        placeStartingAtZero--;
      }
      return {
        school: scoringData.school,
        points: scoringData.points,
        place: placeStartingAtZero + 1,
      };
    });
}

function sortDescByAthleteCountCappedAtFive(
  a: SchoolScoringData,
  b: SchoolScoringData
): number {
  const aCappedAthletes = Math.min(5, a.athletes);
  const bCappedAthletes = Math.min(5, b.athletes);
  return bCappedAthletes - aCappedAthletes;
}

function sortAscByPoints(a: SchoolScoringData, b: SchoolScoringData): number {
  return a.points - b.points;
}

function sortAscBySixthAthleteTeamPlace(
  a: SchoolScoringData,
  b: SchoolScoringData
): number {
  const comparison =
    a.sixthAthleteTeamPlace.unwrapOr(Infinity) -
    b.sixthAthleteTeamPlace.unwrapOr(Infinity);
  if (isNaN(comparison)) {
    return 0;
  } else {
    return comparison;
  }
}

function prioritizeSorters<T>(
  ...sorters: ((a: T, b: T) => number)[]
): (a: T, b: T) => number {
  return (a, b) => {
    for (let i = 0; i < sorters.length; i++) {
      const sort = sorters[i];
      const comparison = sort(a, b);
      if (comparison !== 0) {
        return comparison;
      }
    }
    return 0;
  };
}

function areValuesEqual<T>(
  a: T,
  b: T,
  sorter: (a: T, b: T) => number
): boolean {
  return sorter(a, b) === 0;
}
