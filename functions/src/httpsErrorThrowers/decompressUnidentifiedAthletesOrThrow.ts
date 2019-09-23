import * as functions from "firebase-functions";

import Option from "../types/Option";
import {
  CompressedUnidentifiedAthlete,
  UnidentifiedAthlete,
  decompressUnidentifiedAthlete,
} from "../athlete/types";
import { TeamsRecipe } from "../types/team";

const { HttpsError } = functions.https;

export default function decompressUnidentifiedAthletesOrThrow(
  compressedAthletes: CompressedUnidentifiedAthlete[],
  teams: TeamsRecipe
): UnidentifiedAthlete[] {
  return Option.all(
    compressedAthletes.map(compressed =>
      decompressUnidentifiedAthlete(compressed, teams)
    )
  ).expect(new HttpsError("invalid-argument", "Invalid team number."));
}
