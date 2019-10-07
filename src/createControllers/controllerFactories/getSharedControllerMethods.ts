import { StateType } from "../../types/states";
import Option from "../../types/Option";

import getUserSeasons from "../../firestore/getUserSeasons";

import getUserName from "../../firestore/getUserName";

import { SeasonSummary, Gender } from "../../types/misc";
import { SharedControllerMethods } from "../../types/controllers";
import doesUserHaveWriteAccessToSeason from "../../firestore/doesUserHaveWriteAccessToSeason";
import getSeasonMeets from "../../firestore/getSeasonMeets";
import getSeasonGradeBounds from "../../firestore/getSeasonGradeBounds";
import openSeasonAthletesHandleUntil from "../../firestore/openSeasonAthletesHandleUntil";
import { UnknownScreenHandle } from "../../types/handle";
import guessFullName from "../../guessFullName";

export default function getSharedControllerMethods(
  app: UnknownScreenHandle
): SharedControllerMethods {
  return {
    navigateToSearchForSeasonScreen() {
      app.pushScreen(StateType.SearchForSeason, {
        user: app.getUser(),
        query: "",
        isLoading: false,
        seasons: Option.none(),
      });
    },
    navigateToSignInScreen() {
      app.pushScreen(StateType.SignIn, {});
    },
    navigateToUserSeasonsScreen() {
      app.getUser().match({
        none: () => {
          throw new Error(
            "Attempted to navigateToUserSeasonsScreen when user was not signed in."
          );
        },
        some: user => {
          app
            .pushScreen(StateType.UserSeasons, {
              user,
              seasons: Option.none(),
            })
            .then(screen => {
              getUserSeasons(user).then(seasonSummaries => {
                screen.update({ seasons: Option.some(seasonSummaries) });
              });
            });
        },
      });
    },
    navigateToUserProfileScreen() {
      app
        .pushScreen(StateType.UserProfile, {
          user: app
            .getUser()
            .expect(
              "Attempted to navigateToUserProfileScreen when user was not signed in."
            ),
          fullName: Option.none(),
          doesUserExist: true,
        })
        .then(screen => {
          getUserName(screen.state.user).then(profile => {
            profile.match({
              none: () => {
                screen.update({
                  fullName: Option.some(
                    guessFullName(screen.state.user.displayName || "")
                  ),
                  doesUserExist: false,
                });
              },
              some: profile => {
                screen.update({ fullName: Option.some(profile) });
              },
            });
          });
        });
    },
    viewSeason(seasonSummary: SeasonSummary) {
      app.pushScreen(StateType.SeasonMenu, {
        user: app.getUser(),
        seasonSummary,
      });
    },
    navigateToAthletesMenu(
      user: Option<firebase.User>,
      seasonSummary: SeasonSummary,
      userHasAccessToSeason: Option<boolean>
    ) {
      app
        .pushScreen(StateType.AthletesMenu, {
          user,
          doesUserHaveWriteAccess: userHasAccessToSeason.unwrapOr(false),
          seasonSummary: seasonSummary,
          athletes: Option.none(),
          athleteFilter: {
            grade: Option.none<number>(),
            gender: Option.none<Gender>(),
            school: Option.none<string>(),
          },
          teamsRecipe: Option.none(),
          shouldSortByLastName: false,
          pendingAthleteEdit: Option.none(),
          pendingEditsBeingSyncedWithFirestore: [],
          deleteAthletes: Option.none(),
          isSpreadsheetDataShown: false,
        })
        .then(screen => {
          const seasonId = seasonSummary.id;

          userHasAccessToSeason.ifNone(() => {
            user.ifSome(user => {
              doesUserHaveWriteAccessToSeason(user, seasonId).then(
                hasAccess => {
                  if (hasAccess) {
                    screen.update({ doesUserHaveWriteAccess: true });
                  }
                }
              );
            });
          });

          const {
            teamsRecipe: raceDivisions,
            athletes,
          } = openSeasonAthletesHandleUntil(seasonId, screen.expiration);
          raceDivisions.then(raceDivisions => {
            screen.update({ teamsRecipe: Option.some(raceDivisions) });
          });
          athletes.onUpdate(athletes => {
            screen.update({ athletes: Option.some(athletes) });
          });
        });
    },
    navigateToSeasonMeetsScreen({
      user,
      seasonSummary,
    }: {
      user: Option<firebase.User>;
      seasonSummary: SeasonSummary;
    }) {
      app
        .pushScreen(StateType.SeasonMeets, {
          user,
          doesUserHaveWriteAccess: false,
          seasonSummary,
          meets: Option.none(),
          gradeBounds: Option.none(),
          pendingMeetName: "",
        })
        .then(screen => {
          const seasonId = seasonSummary.id;
          user.ifSome(user => {
            doesUserHaveWriteAccessToSeason(user, seasonId).then(hasAccess => {
              if (hasAccess) {
                screen.update({ doesUserHaveWriteAccess: true });
              }
            });
          });
          getSeasonMeets(seasonId).then(meets => {
            screen.update({ meets: Option.some(meets) });
          });
          getSeasonGradeBounds(seasonId).then(gradeBounds => {
            screen.update({ gradeBounds: Option.some(gradeBounds) });
          });
        });
    },
  };
}
