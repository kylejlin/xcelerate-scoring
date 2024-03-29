import { StateType } from "../../types/states";
import Option from "../../types/Option";

import { api, User } from "../../api";

import { Season, Gender } from "../../types/misc";
import { SharedControllerMethods } from "../../types/controllers";
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
              api.getUserSeasons(user.uid).then(seasonSummaries => {
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
          api.getUserName(screen.state.user.uid).then(profile => {
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
    viewSeason(season: Season) {
      app.pushScreen(StateType.SeasonMenu, {
        user: app.getUser(),
        season,
      });
    },
    navigateToAthletesMenu(
      user: Option<User>,
      season: Season,
      userHasAccessToSeason: Option<boolean>
    ) {
      app
        .pushScreen(StateType.AthletesMenu, {
          user,
          doesUserHaveWriteAccess: userHasAccessToSeason.unwrapOr(false),
          season: season,
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
          const seasonId = season.id;

          userHasAccessToSeason.ifNone(() => {
            user.ifSome(user => {
              api
                .getUserSeasonPermissions(user.uid, seasonId)
                .then(permissions => {
                  screen.update({
                    doesUserHaveWriteAccess: permissions.hasWriteAccess,
                  });
                });
            });
          });

          const {
            teamsRecipe: raceDivisions,
            athletes,
          } = api.openSeasonAthletesHandleUntil(seasonId, screen.expiration);
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
      season,
    }: {
      user: Option<User>;
      season: Season;
    }) {
      app
        .pushScreen(StateType.SeasonMeets, {
          user,
          doesUserHaveWriteAccess: false,
          season,
          meets: Option.none(),
          gradeBounds: Option.none(),
          pendingMeetName: "",
        })
        .then(screen => {
          const seasonId = season.id;
          user.ifSome(user => {
            api
              .getUserSeasonPermissions(user.uid, seasonId)
              .then(permissions => {
                screen.update({
                  doesUserHaveWriteAccess: permissions.hasWriteAccess,
                });
              });
          });
          api.getSeasonMeets(seasonId).then(meets => {
            screen.update({ meets: Option.some(meets) });
          });
          api.getSeason(seasonId).then(season => {
            screen.update({
              gradeBounds: Option.some({
                min: season.minGrade,
                max: season.maxGrade,
              }),
            });
          });
        });
    },
  };
}
