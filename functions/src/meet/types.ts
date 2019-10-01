import { DivisionsRecipe } from "../types/team";

export interface Meet extends DivisionsRecipe {
  divisionFinisherIds: number[][];
}

export type Action = InsertAtBottom | InsertAbove | Delete;

export enum ActionType {
  InsertAtBottom = 0,
  InsertAbove = 1,
  Delete = 2,
}

export interface InsertAtBottom {
  kind: ActionType.InsertAtBottom;
  raceIndex: number;
  athleteId: number;
}

export interface InsertAbove {
  kind: ActionType.InsertAbove;
  raceIndex: number;
  athleteId: number;
  insertionIndex: number;
}

export interface Delete {
  kind: ActionType.Delete;
  raceIndex: number;
  athleteId: number;
}
