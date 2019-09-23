import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { Meet } from "../meet/types";
import parseMeet from "../meet/parseMeet";

const { HttpsError } = functions.https;

export default function getMeetOrReject(
  transaction: admin.firestore.Transaction,
  meetRef: admin.firestore.DocumentReference
): Promise<Meet> {
  return transaction.get(meetRef).then(doc => {
    const aggregateData = doc.data();
    if (aggregateData === undefined) {
      const meetId = meetRef.id;
      throw new HttpsError("invalid-argument", "Invalid meet id: " + meetId);
    } else {
      return parseMeet(aggregateData).expect(
        new HttpsError("internal", "Malformed meet document.")
      );
    }
  });
}
