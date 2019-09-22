import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { isObject, isInt } from "../types/misc";

const { HttpsError } = functions.https;

export default function getUpdateMeetDataOrThrow(
  data: admin.firestore.DocumentData
): { seasonId: string; meetId: string; instructions: number[] } {
  if (isObject(data)) {
    const { seasonId, meetId, instructions } = data;
    if (
      "string" === typeof seasonId &&
      "string" === typeof meetId &&
      Array.isArray(instructions) &&
      instructions.every(isInt)
    ) {
      return { seasonId, meetId, instructions };
    }
  }
  throw new HttpsError("invalid-argument", "");
}
