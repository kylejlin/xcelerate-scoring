import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import parseMeet from "../meet/parseMeet";
import Option from "../types/Option";

const { HttpsError } = functions.https;

export default function getUndeletableIdsOrThrow(
  meetDocs: admin.firestore.QueryDocumentSnapshot[]
): number[] {
  const meets = Option.all(meetDocs.map(doc => parseMeet(doc.data()))).expect(
    new HttpsError("internal", "Malformed meet document.")
  );
  return meets.flatMap(meet => meet.divisionFinisherIds.flat());
}
