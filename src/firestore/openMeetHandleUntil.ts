import firebase from "../firebase";

import { Meet } from "../types/misc";
import Option from "../types/Option";
import { RaceDivisionsRecipe, RaceAction, RaceActionKind } from "../types/race";
import { Command } from "./private/instructions";

const db = firebase.firestore();

export default function openMeetHandleUntil(
  seasonId: string,
  meetId: string,
  waitForStopListeningSignal: Promise<void>
): {
  raceDivisions: Promise<RaceDivisionsRecipe>;
  meet: {
    onUpdate(listener: (meet: Meet) => void): void;
  };
} {
  const listeners: ((athletes: Meet) => void)[] = [];
  let resolveRaceDivisions:
    | ((divisions: RaceDivisionsRecipe) => void)
    | null = null;
  const raceDivisions: Promise<RaceDivisionsRecipe> = new Promise(resolve => {
    resolveRaceDivisions = resolve;
  });
  const stopListening = db
    .collection("seasons")
    .doc(seasonId)
    .collection("meets")
    .doc(meetId)
    .onSnapshot(doc => {
      const data = doc.data();
      console.log("meet data", data);
      if (data === undefined) {
        stopListening();
        throw new Error(
          "Attempted to call openMeetHandleUntil on a nonexistent meet."
        );
      } else {
        const meet = parseMeet(meetId, data).expect("Malformed meet document.");
        if (resolveRaceDivisions !== null) {
          resolveRaceDivisions(meet);
          resolveRaceDivisions = null;
        }
        listeners.forEach(f => {
          f(meet);
        });
      }
    });
  waitForStopListeningSignal.then(stopListening);
  return {
    raceDivisions,
    meet: {
      onUpdate(listener: (meet: Meet) => void) {
        listeners.push(listener);
      },
    },
  };
}

function parseMeet(
  meetId: string,
  data: firebase.firestore.DocumentData
): Option<Meet> {
  const { name, payload, timeCreated } = data;
  if (
    "string" === typeof name &&
    Array.isArray(payload) &&
    timeCreated instanceof firebase.firestore.Timestamp
  ) {
    const [minGrade, maxGrade, ...flattenedInstructionsArray] = payload;
    if (
      isPositiveInt(minGrade) &&
      isPositiveInt(maxGrade) &&
      minGrade <= maxGrade
    ) {
      return parseFlat2dList(flattenedInstructionsArray)
        .andThen(instructionsArray =>
          Option.all(instructionsArray.map(parseInstructions))
        )
        .map(actionsArray => ({
          id: meetId,
          name,
          timeCreated: timeCreated.toDate(),
          minGrade,
          maxGrade,
          orderedRaceActions: actionsArray,
        }));
    }
  }

  return Option.none();
}

function isPositiveInt(n: unknown): n is number {
  return isInt(n) && n > 0;
}

function isNonNegativeInt(n: unknown): n is number {
  return isInt(n) && n >= 0;
}

function isInt(n: unknown): n is number {
  return n === parseInt("" + n, 10);
}

function parseFlat2dList(arr: unknown[]): Option<any[][]> {
  const parsed = [];
  let cursor = 0;
  while (cursor < arr.length) {
    const subArrLen = arr[cursor];
    if (!isNonNegativeInt(subArrLen)) {
      return Option.none();
    }
    cursor++;
    if (cursor + subArrLen > arr.length) {
      return Option.none();
    }
    parsed.push(arr.slice(cursor, cursor + subArrLen));
    cursor += subArrLen;
  }
  return Option.some(parsed);
}

function parseInstructions(instructions: number[]): Option<RaceAction[]> {
  const actions: RaceAction[] = [];
  let i = 0;
  while (i < instructions.length) {
    const commandResult = evaluateCommand(instructions.slice(i));
    // eslint-disable-next-line
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
): Option<{ actions: RaceAction[]; instructionsEvaluated: number }> {
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
          kind: RaceActionKind.InsertAtEnd,
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
        actions: [
          { kind: RaceActionKind.InsertAbove, athleteId, insertionIndex },
        ],
        instructionsEvaluated: 3,
      });
    }
    case Command.DeleteOneAthlete: {
      const athleteId = instructions[1];
      if (!isNonNegativeInt(athleteId)) {
        return Option.none();
      }
      return Option.some({
        actions: [{ kind: RaceActionKind.Delete, athleteId }],
        instructionsEvaluated: 2,
      });
    }
    default:
      return Option.none();
  }
}
