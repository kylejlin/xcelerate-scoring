import * as admin from "firebase-admin";

import Option from "../types/Option";
import { Meet, Action } from "./types";
import { isInt } from "../types/misc";
import parseFlattened2dArray from "../parseFlattened2dArray";
import parseInstructions from "./parseInstructions";

export default function parseMeet(
  data: admin.firestore.DocumentData
): Option<Meet> {
  const { payload } = data;
  if (Array.isArray(payload) && payload.every(isInt)) {
    const [minGrade, maxGrade, ...rest] = payload;
    if (minGrade > 0 && minGrade <= maxGrade) {
      return parseRaces(rest).map(orderedRaceActions => ({
        minGrade,
        maxGrade,
        orderedRaceActions,
      }));
    }
  }

  return Option.none();
}

function parseRaces(data: number[]): Option<Action[][]> {
  const raceInstructionsArray = parseFlattened2dArray(data) as Option<
    number[][]
  >;

  return raceInstructionsArray.andThen(raceInstructionsArray =>
    Option.all(raceInstructionsArray.map(parseInstructions))
  );
}
