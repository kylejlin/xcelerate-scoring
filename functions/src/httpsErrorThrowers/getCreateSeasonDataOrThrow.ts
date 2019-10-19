import * as functions from "firebase-functions";

import { SeasonSpec, isSeasonSpec } from "../types/misc";

const { HttpsError } = functions.https;

export default function getCreateMeetDataOrThrow(data: unknown): SeasonSpec {
  if (isSeasonSpec(data)) {
    return data;
  }
  throw new HttpsError("invalid-argument", "Invalid season specification.");
}
