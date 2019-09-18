import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as flatMap from "array.prototype.flatmap";

import {
  isCompressedUnidentifiedAthlete,
  decompressUnidentifiedAthlete,
  CompressedUnidentifiedAthlete,
} from "./types/athlete";
import { isObject, isNonNegativeInt } from "./types/misc";
import parseAggregate from "./parseAggregate";
import buildAggregatePayload from "./buildAggregatePayload";
import Option from "./types/Option";

if ("function" !== typeof Array.prototype.flatMap) {
  console.log("Shimming flatMap");
  flatMap.shim();
  console.log("flatMap: ", Array.prototype.flatMap);
}

admin.initializeApp();

const db = admin.firestore();

const { HttpsError } = functions.https;

exports.addAthletes = functions.https.onCall((data, ctx) => {
  if (ctx.auth !== undefined) {
    const { uid } = ctx.auth;
    const { seasonId, athletes: compressedAthletes } = validateAddAthleteData(
      data
    );
    console.log("compressedAthletes", compressedAthletes);
    const seasonRef = db.collection("seasons").doc(seasonId);
    const aggregateRef = db.collection("seasonAthleteAggregates").doc(seasonId);
    return db.runTransaction(transaction => {
      return transaction.get(seasonRef).then(seasonDoc => {
        const seasonData = seasonDoc.data();
        if (seasonData === undefined) {
          throw new HttpsError("invalid-argument", "Invalid season id.");
        } else if (
          seasonData.ownerId === uid ||
          seasonData.assistantIds.includes(uid)
        ) {
          console.log("User authenticated");
          return transaction.get(aggregateRef).then(doc => {
            const aggregateData = doc.data();
            console.log("Aggregate data: ", aggregateData);
            if (aggregateData === undefined) {
              throw new HttpsError("invalid-argument", "Invalid season id.");
            } else {
              const athletes = parseAggregate(aggregateData);
              athletes.match({
                none: () => {
                  throw new HttpsError("internal", "Malformed aggregate.");
                },
                some: ({ lowestAvailableAthleteId, teams, athletes }) => {
                  const addedAthletes = compressedAthletes.map(compressed =>
                    decompressUnidentifiedAthlete(compressed, teams)
                  );
                  console.log("addedAthletes", addedAthletes);
                  Option.all(addedAthletes).match({
                    none: () => {
                      throw new HttpsError(
                        "invalid-argument",
                        "Invalid team number."
                      );
                    },
                    some: addedAthletes => {
                      const newLowestAvailableAthleteId =
                        lowestAvailableAthleteId + addedAthletes.length;
                      const newAthletes = athletes.concat(
                        addedAthletes.map((hypotheticalAthlete, i) => ({
                          ...hypotheticalAthlete,
                          id: lowestAvailableAthleteId + i,
                        }))
                      );
                      console.log("Setting aggregate document...");
                      transaction.set(aggregateRef, {
                        lowestAvailableAthleteId: newLowestAvailableAthleteId,
                        payload: buildAggregatePayload(newAthletes, teams),
                      });
                    },
                  });
                },
              });
            }
          });
        } else {
          throw new HttpsError(
            "permission-denied",
            "You do not have write-access to this season."
          );
        }
      });
    });
  } else {
    throw new HttpsError(
      "unauthenticated",
      "You need to sign in to edit this season."
    );
  }
});

function validateAddAthleteData(
  data: unknown
): { seasonId: string; athletes: CompressedUnidentifiedAthlete[] } {
  if (isObject(data)) {
    const { seasonId, athletes } = data;
    if (
      "string" === typeof seasonId &&
      isCompressedUnidentifiedAthleteArray(athletes)
    ) {
      return { seasonId, athletes };
    }
  }
  throw new HttpsError("invalid-argument", "");
}

function isCompressedUnidentifiedAthleteArray(
  arr: unknown
): arr is CompressedUnidentifiedAthlete[] {
  return Array.isArray(arr) && arr.every(isCompressedUnidentifiedAthlete);
}

// TODO Check if athletes finished any meets
exports.deleteAthletes = functions.https.onCall((data, ctx) => {
  if (ctx.auth !== undefined) {
    const { uid } = ctx.auth;
    const {
      seasonId,
      athleteIds: deletedAthleteIds,
    } = validateDeleteAthleteData(data);
    const seasonRef = db.collection("seasons").doc(seasonId);
    const aggregateRef = db.collection("seasonAthleteAggregates").doc(seasonId);
    return db.runTransaction(transaction => {
      return transaction.get(seasonRef).then(seasonDoc => {
        const seasonData = seasonDoc.data();
        if (seasonData === undefined) {
          throw new HttpsError("invalid-argument", "Invalid season id.");
        } else if (
          seasonData.ownerId === uid ||
          seasonData.assistantIds.includes(uid)
        ) {
          console.log("User authenticated");
          return transaction.get(aggregateRef).then(doc => {
            const aggregateData = doc.data();
            if (aggregateData === undefined) {
              throw new HttpsError(
                "internal",
                "Missing athlete aggregate for season " + seasonId
              );
            } else {
              const athletes = parseAggregate(aggregateData);
              athletes.match({
                none: () => {
                  throw new HttpsError("internal", "Malformed aggregate.");
                },
                some: ({ teams, athletes }) => {
                  const newAthletes = athletes.filter(
                    athlete => !deletedAthleteIds.includes(athlete.id)
                  );
                  console.log("Setting aggregate document...");
                  transaction.update(aggregateRef, {
                    payload: buildAggregatePayload(newAthletes, teams),
                  });
                },
              });
            }
          });
        } else {
          throw new HttpsError(
            "permission-denied",
            "You do not have write-access to this season."
          );
        }
      });
    });
  } else {
    throw new HttpsError(
      "unauthenticated",
      "You need to sign in to edit this season."
    );
  }
});

function validateDeleteAthleteData(
  data: unknown
): { seasonId: string; athleteIds: number[] } {
  if (isObject(data)) {
    const { seasonId, athleteIds } = data;
    if (
      "string" === typeof seasonId &&
      Array.isArray(athleteIds) &&
      athleteIds.every(isNonNegativeInt)
    ) {
      return { seasonId, athleteIds };
    }
  }
  console.log("Invalid deleteAthleteData: ", data);
  throw new HttpsError(
    "invalid-argument",
    "seasonId must be a string, athleteIds must be an array of non-negative integers."
  );
}
