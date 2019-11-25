import firebase from "../../firebase";
import removeDuplicates from "../../removeDuplicates";
import parseFlattened2dArray from "../../parseFlattened2dArray";

const db = firebase.firestore();

export default function openUndeletableIdsHandleUntil(
  seasonId: string,
  waitForStopListeningSignal: Promise<void>
): {
  undeletableIds: {
    onUpdate(listener: (undeletableIds: number[]) => void): void;
  };
} {
  const listeners: ((undeletableIds: number[]) => void)[] = [];
  const stopListening = db
    .collection("seasons")
    .doc(seasonId)
    .collection("meets")
    .onSnapshot(collection => {
      const { docs } = collection;
      const undeletableIds = getUndeletableIds(docs);
      listeners.forEach(listener => {
        listener(undeletableIds);
      });
    });
  waitForStopListeningSignal.then(() => {
    stopListening();
  });
  return {
    undeletableIds: {
      onUpdate(listener: (undeletableIds: number[]) => void) {
        listeners.push(listener);
      },
    },
  };
}

function getUndeletableIds(
  docs: firebase.firestore.QueryDocumentSnapshot[]
): number[] {
  return removeDuplicates(
    docs.flatMap(doc => {
      const { payload } = doc.data();
      const flattenedDivisionFinisherIds = payload.slice(2);
      const divisionFinisherIds = parseFlattened2dArray(
        flattenedDivisionFinisherIds
      ).expect("Attempted to getUndeletableIds on a malformed meet document.");
      return divisionFinisherIds.flat();
    })
  );
}
