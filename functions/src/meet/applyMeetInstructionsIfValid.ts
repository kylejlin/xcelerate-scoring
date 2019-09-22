import { Meet, Action } from "./types";
import Option from "../types/Option";
import { Athlete } from "../types/athlete";
import parseInstructions from "./parseInstructions";
import {
  getOrderedDivisions,
  Division,
  isAthleteInDivision,
} from "../types/team";

export default function applyMeetInstructionsIfValid(
  instructions: number[],
  meet: Meet,
  athletes: Athlete[]
): Option<Meet> {
  const addedActions = parseInstructions(instructions);
  return addedActions
    .andThen(addedActions => connectActionsToAthletes(addedActions, athletes))
    .andThen(connectedActions => {
      const newMeet = cloneMeet(meet);
      const orderedDivisions = getOrderedDivisions(newMeet);
      for (const action of connectedActions) {
        const race = getRaceAffectedByAction(
          action,
          orderedDivisions,
          newMeet.orderedRaceActions
        );
        if (race.isNone()) {
          return Option.none();
        } else {
          // TODO Validate action before appending
          race.unwrap().push(action.unconnected);
        }
      }
      return Option.some(newMeet);
    });
}

function connectActionsToAthletes(
  actions: Action[],
  athletes: Athlete[]
): Option<ConnectedAction[]> {
  const connectedActions: ConnectedAction[] = [];
  for (const action of actions) {
    const athlete = athletes.find(athlete => athlete.id === action.athleteId);
    if (athlete === undefined) {
      return Option.none();
    } else {
      connectedActions.push({ ...action, athlete, unconnected: action });
    }
  }
  return Option.some(connectedActions);
}

function cloneMeet(meet: Meet): Meet {
  return JSON.parse(JSON.stringify(meet));
}

function getRaceAffectedByAction(
  action: ConnectedAction,
  orderedDivisions: Division[],
  orderedRaces: Race[]
): Option<Race> {
  const divisionIndex = orderedDivisions.findIndex(division =>
    isAthleteInDivision(action.athlete, division)
  );
  const race = orderedRaces[divisionIndex];
  if (race === undefined) {
    return Option.none();
  } else {
    return Option.some(race);
  }
}

type ConnectedAction = Action & { athlete: Athlete; unconnected: Action };
type Race = Action[];
