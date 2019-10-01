import Option from "../types/Option";
import { Action, ActionType } from "./types";
import { isNonNegativeInt } from "../types/misc";

export default function decompressActions(
  compressedActions: number[]
): Option<Action[]> {
  const actions: Action[] = [];
  let i = 0;
  while (i < compressedActions.length) {
    const kind = compressedActions[i];
    switch (kind) {
      case ActionType.InsertAtBottom: {
        const raceIndex = compressedActions[i + 1];
        const athleteId = compressedActions[i + 2];
        if (isNonNegativeInt(raceIndex) && isNonNegativeInt(athleteId)) {
          actions.push({ kind, raceIndex, athleteId });
          i += 3;
          break;
        } else {
          return Option.none();
        }
      }
      case ActionType.InsertAbove: {
        const raceIndex = compressedActions[i + 1];
        const athleteId = compressedActions[i + 2];
        const insertionIndex = compressedActions[i + 3];
        if (
          isNonNegativeInt(raceIndex) &&
          isNonNegativeInt(athleteId) &&
          isNonNegativeInt(insertionIndex)
        ) {
          actions.push({ kind, raceIndex, athleteId, insertionIndex });
          i += 4;
          break;
        } else {
          return Option.none();
        }
      }
      case ActionType.Delete: {
        const raceIndex = compressedActions[i + 1];
        const athleteId = compressedActions[i + 2];
        if (isNonNegativeInt(raceIndex) && isNonNegativeInt(athleteId)) {
          actions.push({ kind, raceIndex, athleteId });
          i += 3;
          break;
        } else {
          return Option.none();
        }
      }
      default:
        return Option.none();
    }
  }
  return Option.some(actions);
}
