import { DivisionsRecipe } from "../types/team";

export interface Meet extends DivisionsRecipe {
  orderedRaceActions: Action[][];
}

export type Action = InsertAtBottom | InsertAbove | Delete;

export enum ActionType {
  InsertAtBottom = 0,
  InsertAbove = 1,
  Delete = 2,
}

export interface InsertAtBottom {
  kind: ActionType.InsertAtBottom;
  athleteId: number;
}

export interface InsertAbove {
  kind: ActionType.InsertAbove;
  athleteId: number;
  insertionIndex: number;
}

export interface Delete {
  kind: ActionType.Delete;
  athleteId: number;
}

export enum Command {
  InsertNAthletesAtBottom = 0,
  InsertOneAthleteAbove = 1,
  DeleteOneAthlete = 2,
}
