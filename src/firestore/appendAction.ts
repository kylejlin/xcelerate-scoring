import { updateMeet } from "./private/cloudFunctions";
import { RaceAction, RaceActionKind } from "../types/race";
import { Command } from "./private/instructions";

export default function appendAction(
  seasonId: string,
  meetId: string,
  action: RaceAction
): Promise<void> {
  return updateMeet({
    seasonId,
    meetId,
    instructions: compileInstructions(action),
  }).then(() => {});
}

function compileInstructions(action: RaceAction): number[] {
  switch (action.kind) {
    case RaceActionKind.InsertAtEnd:
      return [Command.InsertNAthletesAtBottom, 1, action.athleteId];
    case RaceActionKind.InsertAbove:
      return [
        Command.InsertOneAthleteAbove,
        action.athleteId,
        action.insertionIndex,
      ];
    case RaceActionKind.Delete:
      return [Command.DeleteOneAthlete, action.athleteId];
  }
}
