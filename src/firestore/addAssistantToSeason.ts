import firebase from "../firebase";

const db = firebase.firestore();

export default function addAssistantToSeason(
  assistantId: string,
  seasonId: string
): Promise<void> {
  return db
    .collection("seasons")
    .doc(seasonId)
    .update({
      assistantIds: firebase.firestore.FieldValue.arrayUnion(assistantId),
    });
}
