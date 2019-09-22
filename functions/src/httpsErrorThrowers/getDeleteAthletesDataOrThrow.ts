import * as functions from "firebase-functions";

import { isObject, isNonNegativeInt } from "../types/misc";

const { HttpsError } = functions.https;

export default function getDeleteAthletesDataOrThrow(
  data: unknown
): { seasonId: string; athleteIds: number[] } {
  if (isObject(data)) {
    const { seasonId, athleteIds } = data;
    if (
      "string" === typeof seasonId &&
      Array.isArray(athleteIds) &&
      athleteIds.every(isNonNegativeInt)
    ) {
      return { seasonId, athleteIds };
    }
  }
  console.log("Invalid deleteAthleteData: ", data);
  throw new HttpsError(
    "invalid-argument",
    "seasonId must be a string, athleteIds must be an array of non-negative integers."
  );
}
