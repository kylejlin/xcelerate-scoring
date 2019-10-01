import { Meet, Action, ActionType } from "./types";
import Option from "../types/Option";
import { Athlete } from "../athlete/types";
import { getOrderedDivisions, isAthleteInDivision } from "../types/team";

export default function applyRaceActionsIfValid(
  actions: Action[],
  meet: Meet,
  athletes: Athlete[]
): Option<Meet> {
  return actions.reduce(
    (newMeet, action) =>
      newMeet.andThen(newMeet =>
        applyRaceActionIfValid(action, newMeet, athletes)
      ),
    Option.some(meet)
  );
}

function applyRaceActionIfValid(
  action: Action,
  meet: Meet,
  athletes: Athlete[]
): Option<Meet> {
  const newMeet = cloneMeet(meet);
  const orderedDivisions = getOrderedDivisions(newMeet);
  const athlete = athletes.find(a => a.id === action.athleteId);
  const division = orderedDivisions[action.raceIndex];
  const finisherIds = newMeet.divisionFinisherIds[action.raceIndex];
  if (
    division !== undefined &&
    finisherIds !== undefined &&
    athlete !== undefined &&
    isActionValid(action, finisherIds, isAthleteInDivision(athlete, division))
  ) {
    mutablyApplyValidatedAction(action, newMeet);
    return Option.some(newMeet);
  } else {
    return Option.none();
  }
}

function cloneMeet(meet: Meet): Meet {
  return JSON.parse(JSON.stringify(meet));
}

function isActionValid(
  action: Action,
  finisherIds: number[],
  athleteInDivision: boolean
): boolean {
  switch (action.kind) {
    case ActionType.InsertAtBottom:
      return !finisherIds.includes(action.athleteId) && athleteInDivision;
    case ActionType.InsertAbove:
      return (
        !finisherIds.includes(action.athleteId) &&
        athleteInDivision &&
        action.insertionIndex < finisherIds.length
      );
    case ActionType.Delete:
      return finisherIds.includes(action.athleteId);
  }
}

function mutablyApplyValidatedAction(action: Action, meet: Meet) {
  switch (action.kind) {
    case ActionType.InsertAtBottom:
      meet.divisionFinisherIds[action.raceIndex].push(action.athleteId);
      break;
    case ActionType.InsertAbove:
      meet.divisionFinisherIds[action.raceIndex].splice(
        action.insertionIndex,
        0,
        action.athleteId
      );
      break;
    case ActionType.Delete:
      meet.divisionFinisherIds[action.raceIndex] = meet.divisionFinisherIds[
        action.raceIndex
      ].filter(finisherId => finisherId !== action.athleteId);
      break;
  }
}
