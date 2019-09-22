import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { isObject } from "../types/misc";

const { HttpsError } = functions.https;

export default function getCreateMeetDataOrThrow(
  data: admin.firestore.DocumentData
): { seasonId: string; meetName: string } {
  if (isObject(data)) {
    const { seasonId, meetName } = data;
    if ("string" === typeof seasonId && "string" === typeof meetName) {
      return { seasonId, meetName };
    }
  }
  throw new HttpsError("invalid-argument", "");
}
