import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as flatMap from "array.prototype.flatmap";

import buildAggregatePayload from "./athleteAggregate/buildAggregatePayload";
import getSeasonDataIfUserHasWriteAccess from "./getSeasonDataIfUserHasWriteAccess";
import getAddAthleteDataOrThrow from "./httpsErrorThrowers/getAddAthleteDataOrThrow";
import getUidOrThrow from "./httpsErrorThrowers/getUidOrThrow";
import getAggregateOrReject from "./httpsErrorThrowers/getAggregateOrReject";
import decompressUnidentifiedAthletesOrThrow from "./httpsErrorThrowers/decompressUnidentifiedAthletesOrThrow";
import getDeleteAthletesDataOrThrow from "./httpsErrorThrowers/getDeleteAthletesDataOrThrow";

if ("function" !== typeof Array.prototype.flatMap) {
  flatMap.shim();
}

admin.initializeApp();

const db = admin.firestore();

exports.addAthletes = functions.https.onCall((data, ctx) => {
  const uid = getUidOrThrow(ctx);
  const { seasonId, athletes: compressedAthletes } = getAddAthleteDataOrThrow(
    data
  );
  return db.runTransaction(transaction => {
    const seasonRef = db.collection("seasons").doc(seasonId);
    return getSeasonDataIfUserHasWriteAccess(seasonRef, uid, transaction).then(
      () => {
        const aggregateRef = db
          .collection("seasonAthleteAggregates")
          .doc(seasonId);
        return getAggregateOrReject(transaction, aggregateRef).then(
          ({ lowestAvailableAthleteId, teams, athletes }) => {
            const addedAthletes = decompressUnidentifiedAthletesOrThrow(
              compressedAthletes,
              teams
            );
            const newLowestAvailableAthleteId =
              lowestAvailableAthleteId + addedAthletes.length;
            const newAthletes = athletes.concat(
              addedAthletes.map((hypotheticalAthlete, i) => ({
                ...hypotheticalAthlete,
                id: lowestAvailableAthleteId + i,
              }))
            );
            const aggregateRef = db
              .collection("seasonAthleteAggregates")
              .doc(seasonId);
            transaction.set(aggregateRef, {
              lowestAvailableAthleteId: newLowestAvailableAthleteId,
              payload: buildAggregatePayload(newAthletes, teams),
            });
          }
        );
      }
    );
  });
});

// TODO Check if athletes finished any meets
exports.deleteAthletes = functions.https.onCall((data, ctx) => {
  const uid = getUidOrThrow(ctx);
  const {
    seasonId,
    athleteIds: deletedAthleteIds,
  } = getDeleteAthletesDataOrThrow(data);
  return db.runTransaction(transaction => {
    const seasonRef = db.collection("seasons").doc(seasonId);
    return getSeasonDataIfUserHasWriteAccess(seasonRef, uid, transaction).then(
      () => {
        const aggregateRef = db
          .collection("seasonAthleteAggregates")
          .doc(seasonId);
        return getAggregateOrReject(transaction, aggregateRef).then(
          ({ teams, athletes }) => {
            const newAthletes = athletes.filter(
              athlete => !deletedAthleteIds.includes(athlete.id)
            );
            const aggregateRef = db
              .collection("seasonAthleteAggregates")
              .doc(seasonId);
            transaction.update(aggregateRef, {
              payload: buildAggregatePayload(newAthletes, teams),
            });
          }
        );
      }
    );
  });
});
