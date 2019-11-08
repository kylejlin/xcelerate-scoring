import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as flat from "array.prototype.flat";
import * as flatMap from "array.prototype.flatmap";

import buildAggregatePayload from "./athlete/buildAggregatePayload";
import getSeasonDataIfUserHasWriteAccess from "./getSeasonDataIfUserHasWriteAccess";
import getAddAthleteDataOrThrow from "./httpsErrorThrowers/getAddAthleteDataOrThrow";
import getUidOrThrow from "./httpsErrorThrowers/getUidOrThrow";
import getAggregateOrReject from "./httpsErrorThrowers/getAggregateOrReject";
import decompressUnidentifiedAthletesOrThrow from "./httpsErrorThrowers/decompressUnidentifiedAthletesOrThrow";
import getDeleteAthletesDataOrThrow from "./httpsErrorThrowers/getDeleteAthletesDataOrThrow";
import getMeetOrReject from "./httpsErrorThrowers/getMeetOrReject";
import buildMeetPayload from "./meet/buildMeetPayload";
import getInitialMeetPayload from "./meet/getInitialMeetPayload";
import getCreateMeetDataOrThrow from "./httpsErrorThrowers/getCreateMeetDataOrThrow";
import { DivisionsRecipe } from "./types/team";
import getUpdateAthletesDataOrThrow from "./httpsErrorThrowers/getUpdateAthletesDataOrThrow";
import decompressAthletesOrThrow from "./httpsErrorThrowers/decompressAthletesOrThrow";
import getApplyRaceActionsDataOrThrow from "./httpsErrorThrowers/getApplyRaceActionsDataOrThrow";
import applyRaceActionsOrThrow from "./httpsErrorThrowers/applyRaceActionsOrThrow";
import decompressActionsOrThrow from "./httpsErrorThrowers/decompressActionsOrThrow";
import getUndeletableIdsOrThrow from "./httpsErrorThrowers/getUndeletableIdsOrThrow";
import getCreateSeasonDataOrThrow from "./httpsErrorThrowers/getCreateSeasonDataOrThrow";
import getDeleteTestSeasonDataOrThrow from "./httpsErrorThrowers/getDeleteTestSeasonDataOrThrow";
import getSeasonDataIfUserIsOwner from "./getSeasonDataIfUserIsOwner";
import { Season } from "./types/misc";

if ("function" !== typeof Array.prototype.flat) {
  flat.shim();
}
if ("function" !== typeof Array.prototype.flatMap) {
  flatMap.shim();
}

admin.initializeApp();

const db = admin.firestore();
const { HttpsError } = functions.https;

// xceleratetesting@gmail.com
const TEST_ACCOUNT_UID = "DCWja0eXZiNBP3WKukvDQ73A2GU2";

exports.createSeason = functions.https.onCall(
  (data, ctx): Promise<Season> => {
    const uid = getUidOrThrow(ctx);
    const { name, minGrade, maxGrade, schools } = getCreateSeasonDataOrThrow(
      data
    );
    const seasonData: Omit<Season, "id"> = {
      ownerId: uid,
      assistantIds: [],
      name,
      minGrade,
      maxGrade,
      schools,
    };
    const seasonRef = db.collection("seasons").doc();
    const aggregateRef = db
      .collection("seasonAthleteAggregates")
      .doc(seasonRef.id);
    const batch = db.batch();
    batch.create(seasonRef, seasonData);
    batch.create(aggregateRef, {
      lowestAvailableAthleteId: 0,
      payload: buildAggregatePayload([], seasonData),
    });
    return batch.commit().then(() => ({ ...seasonData, id: seasonRef.id }));
  }
);

exports.deleteTestSeason = functions.https.onCall(
  (data, ctx): Promise<void> => {
    const uid = getUidOrThrow(ctx);
    if (uid !== TEST_ACCOUNT_UID) {
      throw new HttpsError(
        "permission-denied",
        "Only the test user (xceleratetesting@gmail.com) can delete their seasons."
      );
    }
    const { seasonId } = getDeleteTestSeasonDataOrThrow(data);
    const seasonRef = db.collection("seasons").doc(seasonId);
    const aggregateRef = db.collection("seasonAthleteAggregates").doc(seasonId);
    return db.runTransaction(transaction => {
      return getSeasonDataIfUserIsOwner(seasonRef, uid, transaction).then(
        () => {
          transaction.delete(seasonRef);
          transaction.delete(aggregateRef);
        }
      );
    });
  }
);

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

exports.updateAthletes = functions.https.onCall((data, ctx) => {
  const uid = getUidOrThrow(ctx);
  const {
    seasonId,
    athletes: compressedAthletes,
  } = getUpdateAthletesDataOrThrow(data);
  return db.runTransaction(transaction => {
    const seasonRef = db.collection("seasons").doc(seasonId);
    return getSeasonDataIfUserHasWriteAccess(seasonRef, uid, transaction).then(
      () => {
        const aggregateRef = db
          .collection("seasonAthleteAggregates")
          .doc(seasonId);
        return getAggregateOrReject(transaction, aggregateRef).then(
          ({ teams, athletes }) => {
            const updatedAthletes = decompressAthletesOrThrow(
              compressedAthletes,
              teams
            );
            const newAthletes = athletes.map(originalAthlete => {
              const updatedAthlete = updatedAthletes.find(
                athlete => athlete.id === originalAthlete.id
              );
              if (updatedAthlete === undefined) {
                return originalAthlete;
              } else {
                return updatedAthlete;
              }
            });
            transaction.update(aggregateRef, {
              payload: buildAggregatePayload(newAthletes, teams),
            });
          }
        );
      }
    );
  });
});

exports.deleteAthletes = functions.https.onCall((data, ctx) => {
  const uid = getUidOrThrow(ctx);
  const {
    seasonId,
    athleteIds: deletedAthleteIds,
  } = getDeleteAthletesDataOrThrow(data);
  return db.runTransaction(transaction => {
    const seasonRef = db.collection("seasons").doc(seasonId);
    const meetsRef = seasonRef.collection("meets");
    return getSeasonDataIfUserHasWriteAccess(seasonRef, uid, transaction).then(
      () => {
        return meetsRef.get().then(meetsCollection => {
          const undeletableIds = getUndeletableIdsOrThrow(meetsCollection.docs);
          if (deletedAthleteIds.some(id => undeletableIds.includes(id))) {
            throw new HttpsError(
              "invalid-argument",
              "Attempted to delete an athlete who finished one or more meets."
            );
          } else {
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
        });
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

exports.applyRaceActions = functions.https.onCall((data, ctx) => {
  const uid = getUidOrThrow(ctx);
  const {
    seasonId,
    meetId,
    actions: compressedActions,
  } = getApplyRaceActionsDataOrThrow(data);
  const actions = decompressActionsOrThrow(compressedActions);
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
          const newMeet = applyRaceActionsOrThrow(
            actions,
            meet,
            aggregate.athletes
          );
          transaction.update(meetRef, { payload: buildMeetPayload(newMeet) });
        });
      }
    );
  });
});
