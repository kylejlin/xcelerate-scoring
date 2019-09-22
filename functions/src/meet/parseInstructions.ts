import Option from "../types/Option";

import { Action, Command, ActionType } from "./types";

import { isNonNegativeInt } from "../types/misc";

export default function parseInstructions(
  instructions: number[]
): Option<Action[]> {
  const actions: Action[] = [];
  let i = 0;
  while (i < instructions.length) {
    const commandResult = evaluateCommand(instructions.slice(i));
    commandResult.ifSome(({ actions: newActions, instructionsEvaluated }) => {
      actions.push(...newActions);
      i += instructionsEvaluated;
    });
    if (commandResult.isNone()) {
      return Option.none();
    }
  }
  return Option.some(actions);
}

function evaluateCommand(
  instructions: number[]
): Option<{ actions: Action[]; instructionsEvaluated: number }> {
  const command = instructions[0];
  if (!isNonNegativeInt(command)) {
    return Option.none();
  }

  switch (command) {
    case Command.InsertNAthletesAtBottom: {
      const numberOfAthletes = instructions[1];
      if (!isNonNegativeInt(numberOfAthletes)) {
        return Option.none();
      }
      const athleteIds = instructions.slice(2, 2 + numberOfAthletes);
      if (
        !(
          athleteIds.every(isNonNegativeInt) &&
          athleteIds.length === numberOfAthletes
        )
      ) {
        return Option.none();
      }
      return Option.some({
        actions: athleteIds.map(athleteId => ({
          kind: ActionType.InsertAtBottom,
          athleteId,
        })),
        instructionsEvaluated: 2 + numberOfAthletes,
      });
    }
    case Command.InsertOneAthleteAbove: {
      const athleteId = instructions[1];
      const insertionIndex = instructions[2];
      if (!(isNonNegativeInt(athleteId) && isNonNegativeInt(insertionIndex))) {
        return Option.none();
      }
      return Option.some({
        actions: [{ kind: ActionType.InsertAbove, athleteId, insertionIndex }],
        instructionsEvaluated: 3,
      });
    }
    case Command.DeleteOneAthlete: {
      const athleteId = instructions[1];
      if (!isNonNegativeInt(athleteId)) {
        return Option.none();
      }
      return Option.some({
        actions: [{ kind: ActionType.Delete, athleteId }],
        instructionsEvaluated: 2,
      });
    }
    default:
      return Option.none();
  }
}
