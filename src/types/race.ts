import firebase from "../firebase";

import { Gender, isGender, Athlete } from "./misc";

import inclusiveIntRange from "../inclusiveIntRange";

export interface RaceDivision {
  grade: number;
  gender: Gender;
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

  getDivisions(gradeBounds: { min: number; max: number }): RaceDivision[] {
    const { min, max } = gradeBounds;
    return inclusiveIntRange(min, max).flatMap(grade => [
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

export type IndexedRaceAction = RaceAction & { index: number };

export type RaceAction = InsertAtEnd | InsertAbove | Delete;

export enum RaceActionKind {
  InsertAtEnd = 0,
  InsertAbove = 1,
  Delete = 2,
}

export interface InsertAtEnd {
  kind: RaceActionKind.InsertAtEnd;

  athleteId: string;
}

export interface InsertAbove {
  kind: RaceActionKind.InsertAbove;

  athleteId: string;
  insertionIndex: number;
}

export interface Delete {
  kind: RaceActionKind.Delete;

  athleteId: string;
}

export class Races {
  private dict: { [key: string]: Race };

  constructor() {
    this.dict = {};
  }

  getRace(division: RaceDivision): Race {
    return this.dict[RaceDivisionUtil.stringify(division)];
  }

  updateRace(race: Race) {
    this.dict[RaceDivisionUtil.stringify(race)] = race;
  }

  getDivisions(): RaceDivision[] {
    return Object.keys(this.dict)
      .filter(key => this.dict[key] instanceof Race)
      .map(RaceDivisionUtil.parse);
  }

  getRaces(): Race[] {
    return this.getDivisions().map(division => this.getRace(division));
  }
}

export class Race {
  grade: number;
  gender: Gender;
  private athletesMostRecentlyActedUpon: [
    string | null,
    string | null,
    string | null,
    string | null
  ];
  private actions: RaceAction[];

  private static getActions(indexedActions: IndexedRaceAction[]): RaceAction[] {
    const actions: RaceAction[] = [];
    indexedActions.forEach(action => {
      actions[action.index] = action;
    });
    return actions;
  }

  constructor(
    data: firebase.firestore.DocumentData,
    indexedActions: IndexedRaceAction[],
    public raceRef: firebase.firestore.DocumentReference
  ) {
    const { grade, gender, athletesMostRecentlyActedUpon } = data;
    const actions = Race.getActions(indexedActions);

    this.grade = grade;
    this.gender = gender;
    this.athletesMostRecentlyActedUpon = athletesMostRecentlyActedUpon;
    this.actions = actions;
  }

  getFinisherIds(): string[] {
    let ids: string[] = [];
    this.actions
      .filter(action => "object" === typeof action)
      .forEach(action => {
        switch (action.kind) {
          case RaceActionKind.InsertAtEnd:
            if (!ids.includes(action.athleteId)) {
              ids.push(action.athleteId);
            }
            break;
          case RaceActionKind.InsertAbove:
            if (!ids.includes(action.athleteId)) {
              ids.splice(action.insertionIndex, 0, action.athleteId);
            }
            break;
          case RaceActionKind.Delete:
            ids = ids.filter(id => id !== action.athleteId);
        }
      });
    return ids;
  }

  setActions(indexedActions: IndexedRaceAction[]): boolean {
    const newActions = Race.getActions(indexedActions);
    const wereNewActionsAdded = newActions.length !== this.actions.length;
    this.actions = newActions;
    return wereNewActionsAdded;
  }
}

export class RaceUpdater {
  private listeners: (() => void)[];

  static updateRacesWhile(
    races: Races,
    shouldContinueListening: () => boolean
  ): RaceUpdater {
    return new RaceUpdater(races, shouldContinueListening);
  }

  private constructor(races: Races, shouldContinueListening: () => boolean) {
    this.listeners = [];

    const cleanupFunctions = races.getRaces().map(race =>
      race.raceRef.collection("actionLists").onSnapshot(actionListsQuery => {
        if (shouldContinueListening()) {
          const actions = actionListsQuery.docs.flatMap(getActions);
          const wereNewActionsAdded = race.setActions(actions);
          if (wereNewActionsAdded) {
            this.callListeners();
          }
        } else {
          cleanupFunctions.forEach(stopListeningToChanges => {
            stopListeningToChanges();
          });
        }
      })
    );
  }

  private callListeners() {
    this.listeners.forEach(listener => {
      listener();
    });
  }

  onUpdate(listener: () => void) {
    this.listeners.push(listener);
  }
}

// TODO DRY
// This duplicates require("../firestore/getMeetRaces").getActions
function getActions(
  doc: firebase.firestore.QueryDocumentSnapshot
): IndexedRaceAction[] {
  const { actions } = doc.data();
  return actions.map((action: Omit<IndexedRaceAction, "athleteId">) => ({
    athleteId: doc.id,
    ...action,
  }));
}
