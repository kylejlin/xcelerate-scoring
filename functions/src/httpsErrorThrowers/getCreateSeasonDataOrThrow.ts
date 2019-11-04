import * as functions from "firebase-functions";

import { SeasonSpec, isValidSeasonSpec } from "../types/misc";

const { HttpsError } = functions.https;

export default function getCreateMeetDataOrThrow(data: unknown): SeasonSpec {
  if (isValidSeasonSpec(data)) {
    return data;
  }
  throw new HttpsError("invalid-argument", "Invalid season specification.");
}
