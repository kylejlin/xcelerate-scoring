import { Meet, Action, ActionType, Command, InsertAtBottom } from "./types";
import Option from "../types/Option";

export default function buildMeetPayload(meet: Meet): number[] {
  const { minGrade, maxGrade } = meet;
  const payload = [minGrade, maxGrade];

  const orderedInstructionArrays = meet.orderedRaceActions.map(
    buildInstructionArray
  );
  orderedInstructionArrays.forEach(instructions => {
    payload.push(instructions.length);
    payload.push(...instructions);
  });

  return payload;
}

function buildInstructionArray(actions: Action[]): number[] {
  const groups = groupInsertAtBottomActionsTogether(actions);
  const instructions: number[] = [];
  groups.forEach(group => {
    const { athleteIdsInsertedAtBottom, nextNonInsertAtBottomAction } = group;
    if (athleteIdsInsertedAtBottom.length > 0) {
      instructions.push(Command.InsertNAthletesAtBottom);
      instructions.push(athleteIdsInsertedAtBottom.length);
      instructions.push(...athleteIdsInsertedAtBottom);
    }
    nextNonInsertAtBottomAction.ifSome(action => {
      switch (action.kind) {
        case ActionType.InsertAbove:
          instructions.push(Command.InsertOneAthleteAbove);
          instructions.push(action.athleteId);
          instructions.push(action.insertionIndex);
          break;
        case ActionType.Delete:
          instructions.push(Command.DeleteOneAthlete);
          instructions.push(action.athleteId);
          break;
      }
    });
  });
  return instructions;
}

function groupInsertAtBottomActionsTogether(
  actions: Action[]
): InsertAtBottomGroup[] {
  const groups: InsertAtBottomGroup[] = [];
  let unprocessedActions = actions;
  while (unprocessedActions.length > 0) {
    const indexOfNextNonInsertAtBottom = unprocessedActions.findIndex(
      action => action.kind !== ActionType.InsertAtBottom
    );
    const nextNonInsertAtBottomAction = unprocessedActions[
      indexOfNextNonInsertAtBottom
    ] as Exclude<Action, InsertAtBottom> | undefined;
    if (nextNonInsertAtBottomAction === undefined) {
      groups.push({
        athleteIdsInsertedAtBottom: unprocessedActions.map(
          action => action.athleteId
        ),
        nextNonInsertAtBottomAction: Option.none(),
      });
      unprocessedActions = [];
    } else {
      groups.push({
        athleteIdsInsertedAtBottom: unprocessedActions
          .slice(0, indexOfNextNonInsertAtBottom)
          .map(action => action.athleteId),
        nextNonInsertAtBottomAction: Option.some(nextNonInsertAtBottomAction),
      });
      unprocessedActions = unprocessedActions.slice(
        indexOfNextNonInsertAtBottom + 1
      );
    }
  }
  return groups;
}

interface InsertAtBottomGroup {
  athleteIdsInsertedAtBottom: number[];
  nextNonInsertAtBottomAction: Option<Exclude<Action, InsertAtBottom>>;
}
