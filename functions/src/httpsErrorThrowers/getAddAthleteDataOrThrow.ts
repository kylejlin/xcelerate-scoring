import * as functions from "firebase-functions";

import { isObject } from "../types/misc";
import {
  CompressedUnidentifiedAthlete,
  isCompressedUnidentifiedAthlete,
} from "../types/athlete";

const { HttpsError } = functions.https;

export default function getAddAthleteDataOrThrow(
  data: unknown
): { seasonId: string; athletes: CompressedUnidentifiedAthlete[] } {
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
): arr is CompressedUnidentifiedAthlete[] {
  return Array.isArray(arr) && arr.every(isCompressedUnidentifiedAthlete);
}
