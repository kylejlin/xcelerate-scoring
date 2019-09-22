import * as functions from "firebase-functions";

import { Meet } from "../meet/types";
import { Athlete } from "../types/athlete";
import applyMeetInstructionsIfValid from "../meet/applyMeetInstructionsIfValid";

const { HttpsError } = functions.https;

export default function applyMeetInstructionsOrThrow(
  instructions: number[],
  meet: Meet,
  athletes: Athlete[]
): Meet {
  return applyMeetInstructionsIfValid(instructions, meet, athletes).expect(
    new HttpsError("invalid-argument", "Invalid meet instructions")
  );
}
