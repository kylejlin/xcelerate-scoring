import { Gender, isGender, Athlete } from "./misc";

import inclusiveIntRange from "../inclusiveIntRange";

export interface RaceDivision {
  grade: number;
  gender: Gender;
}

export interface RaceDivisionsRecipe {
  minGrade: number;
  maxGrade: number;
}

export const RaceDivisionUtil = {
  stringify({ grade, gender }: RaceDivision): string {
    return grade + gender;
  },

  parse(division: string): RaceDivision {
    const grade = parseInt(division.slice(0, -1), 10);
    const gender = division.slice(-1);
    if (!isNaN(grade) && isGender(gender)) {
      return { grade, gender };
    } else {
      throw new SyntaxError("Cannot parse invalid RaceDivison string.");
    }
  },

  getOrderedDivisions({
    minGrade,
    maxGrade,
  }: RaceDivisionsRecipe): RaceDivision[] {
    return inclusiveIntRange(minGrade, maxGrade).flatMap(grade => [
      { grade, gender: Gender.Male },
      { grade, gender: Gender.Female },
    ]);
  },

  getAthleteDivision(athlete: Athlete): RaceDivision {
    return { grade: athlete.grade, gender: athlete.gender };
  },

  areDivisionsEqual(a: RaceDivision, b: RaceDivision): boolean {
    return a.grade === b.grade && a.gender === b.gender;
  },
};

export type RaceAction = InsertAtEnd | InsertAbove | Delete;

export enum RaceActionType {
  InsertAtBottom = 0,
  InsertAbove = 1,
  Delete = 2,
}

export interface InsertAtEnd {
  kind: RaceActionType.InsertAtBottom;
  raceIndex: number;

  athleteId: number;
}

export interface InsertAbove {
  kind: RaceActionType.InsertAbove;
  raceIndex: number;

  athleteId: number;
  insertionIndex: number;
}

export interface Delete {
  kind: RaceActionType.Delete;
  raceIndex: number;

  athleteId: number;
}

export function getFinisherIds(actions: RaceAction[]): number[] {
  let ids: number[] = [];
  actions
    .filter(action => "object" === typeof action)
    .forEach(action => {
      switch (action.kind) {
        case RaceActionType.InsertAtBottom:
          if (!ids.includes(action.athleteId)) {
            ids.push(action.athleteId);
          }
          break;
        case RaceActionType.InsertAbove:
          if (!ids.includes(action.athleteId)) {
            ids.splice(action.insertionIndex, 0, action.athleteId);
          }
          break;
        case RaceActionType.Delete:
          ids = ids.filter(id => id !== action.athleteId);
      }
    });
  return ids;
}
