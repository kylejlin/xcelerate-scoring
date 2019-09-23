import * as functions from "firebase-functions";

import { isObject } from "../types/misc";
import { CompressedAthlete, isCompressedAthlete } from "../athlete/types";

const { HttpsError } = functions.https;

export default function getUpdateAthletesDataOrThrow(
  data: unknown
): { seasonId: string; athletes: CompressedAthlete[] } {
  if (isObject(data)) {
    const { seasonId, athletes } = data;
    if (
      "string" === typeof seasonId &&
      isCompressedUnidentifiedAthleteArray(athletes)
    ) {
      return { seasonId, athletes };
    }
  }
  throw new HttpsError("invalid-argument", "");
}

function isCompressedUnidentifiedAthleteArray(
  arr: unknown
): arr is CompressedAthlete[] {
  return Array.isArray(arr) && arr.every(isCompressedAthlete);
}
