import { RaceAction, RaceActionType } from "../../types/race";

export default function compressActions(actions: RaceAction[]): number[] {
  const compressed: number[] = [];
  actions.forEach(action => {
    switch (action.kind) {
      case RaceActionType.InsertAtBottom:
        compressed.push(action.kind, action.raceIndex, action.athleteId);
        break;
      case RaceActionType.InsertAbove:
        compressed.push(
          action.kind,
          action.raceIndex,
          action.athleteId,
          action.insertionIndex
        );
        break;
      case RaceActionType.Delete:
        compressed.push(action.kind, action.raceIndex, action.athleteId);
        break;
    }
  });
  return compressed;
}
