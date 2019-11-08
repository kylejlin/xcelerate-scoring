import * as functions from "firebase-functions";
import { isObject } from "../types/misc";
const { HttpsError } = functions.https;

export default function getDeleteTestSeasonDataOrThrow(
  data: unknown
): { seasonId: string } {
  if (isObject(data)) {
    const { seasonId } = data;
    if ("string" === typeof seasonId) {
      return { seasonId };
    }
  }
  throw new HttpsError("invalid-argument", "Missing seasonId.");
}
