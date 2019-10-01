import * as functions from "firebase-functions";

import { Meet, Action } from "../meet/types";
import { Athlete } from "../athlete/types";
import applyRaceActionsIfValid from "../meet/applyRaceActionsIfValid";

const { HttpsError } = functions.https;

export default function applyRaceActionsOrThrow(
  actions: Action[],
  meet: Meet,
  athletes: Athlete[]
): Meet {
  return applyRaceActionsIfValid(actions, meet, athletes).expect(
    new HttpsError("invalid-argument", "Invalid action.")
  );
}
