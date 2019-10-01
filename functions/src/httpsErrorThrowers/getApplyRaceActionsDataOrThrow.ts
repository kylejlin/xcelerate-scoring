import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { isObject, isInt } from "../types/misc";

const { HttpsError } = functions.https;

export default function getApplyRaceActionsDataOrThrow(
  data: admin.firestore.DocumentData
): { seasonId: string; meetId: string; actions: number[] } {
  if (isObject(data)) {
    const { seasonId, meetId, actions } = data;
    if (
      "string" === typeof seasonId &&
      "string" === typeof meetId &&
      Array.isArray(actions) &&
      actions.every(isInt)
    ) {
      return { seasonId, meetId, actions };
    }
  }
  throw new HttpsError("invalid-argument", "");
}
