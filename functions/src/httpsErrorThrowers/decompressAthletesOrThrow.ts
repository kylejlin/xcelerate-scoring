import * as functions from "firebase-functions";

import Option from "../types/Option";
import {
  CompressedAthlete,
  Athlete,
  decompressAthlete,
} from "../athlete/types";
import { TeamsRecipe } from "../types/team";

const { HttpsError } = functions.https;

export default function decompressAthletesOrThrow(
  compressedAthletes: CompressedAthlete[],
  teams: TeamsRecipe
): Athlete[] {
  return Option.all(
    compressedAthletes.map(compressed => decompressAthlete(compressed, teams))
  ).expect(new HttpsError("invalid-argument", "Invalid team number."));
}
