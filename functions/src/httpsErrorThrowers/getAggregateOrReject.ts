import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { TeamsRecipe } from "../types/team";
import { Athlete } from "../athlete/types";
import parseAggregate from "../athlete/parseAggregate";

const { HttpsError } = functions.https;

export default function getAggregateOrReject(
  transaction: admin.firestore.Transaction,
  aggregateRef: FirebaseFirestore.DocumentReference
): Promise<{
  lowestAvailableAthleteId: number;
  teams: TeamsRecipe;
  athletes: Athlete[];
}> {
  return transaction.get(aggregateRef).then(doc => {
    const aggregateData = doc.data();
    if (aggregateData === undefined) {
      const seasonId = aggregateRef.id;
      throw new HttpsError(
        "internal",
        "Missing aggregate for season " + seasonId
      );
    } else {
      return parseAggregate(aggregateData).expect(
        new HttpsError("internal", "Malformed aggregate.")
      );
    }
  });
}
