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
import getUpdateMeetDataOrThrow from "./httpsErrorThrowers/getUpdateMeetDataOrThrow";
import getMeetOrReject from "./httpsErrorThrowers/getMeetOrReject";
import applyMeetInstructionsOrThrow from "./httpsErrorThrowers/applyMeetInstructionsOrThrow";
import buildMeetPayload from "./meet/buildMeetPayload";
import getInitialMeetPayload from "./meet/getInitialMeetPayload";
import getCreateMeetDataOrThrow from "./httpsErrorThrowers/getCreateMeetDataOrThrow";
import { DivisionsRecipe } from "./types/team";

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

exports.createMeet = functions.https.onCall((data, ctx) => {
  const uid = getUidOrThrow(ctx);
  const { seasonId, meetName } = getCreateMeetDataOrThrow(data);

  const seasonRef = db.collection("seasons").doc(seasonId);
  const meetRef = seasonRef.collection("meets").doc();
  const now = Date.now();

  return db
    .runTransaction(transaction => {
      return getSeasonDataIfUserHasWriteAccess(
        seasonRef,
        uid,
        transaction
      ).then(seasonData => {
        transaction.set(meetRef, {
          name: meetName,
          timeCreated: new Date(now),
          payload: getInitialMeetPayload(seasonData as DivisionsRecipe),
        });
      });
    })
    .then(() => ({ meetId: meetRef.id, timeCreated: now }));
});

exports.updateMeet = functions.https.onCall((data, ctx) => {
  const uid = getUidOrThrow(ctx);
  const { seasonId, meetId, instructions } = getUpdateMeetDataOrThrow(data);
  return db.runTransaction(transaction => {
    const seasonRef = db.collection("seasons").doc(seasonId);
    return getSeasonDataIfUserHasWriteAccess(seasonRef, uid, transaction).then(
      () => {
        const meetRef = seasonRef.collection("meets").doc(meetId);
        const aggregateRef = db
          .collection("seasonAthleteAggregates")
          .doc(seasonId);
        return Promise.all([
          getMeetOrReject(transaction, meetRef),
          getAggregateOrReject(transaction, aggregateRef),
        ]).then(([meet, aggregate]) => {
          const newMeet = applyMeetInstructionsOrThrow(
            instructions,
            meet,
            aggregate.athletes
          );
          transaction.update(meetRef, { payload: buildMeetPayload(newMeet) });
        });
      }
    );
  });
});
