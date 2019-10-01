import * as functions from "firebase-functions";

import { Action } from "../meet/types";
import decompressActions from "../meet/decompressActions";

const { HttpsError } = functions.https;

export default function decompressActionsOrThrow(
  compressedActions: number[]
): Action[] {
  return decompressActions(compressedActions).expect(
    new HttpsError("invalid-argument", "Invalid actions.")
  );
}
