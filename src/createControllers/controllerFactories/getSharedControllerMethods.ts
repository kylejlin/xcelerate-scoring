import App from "../../App";

import {
  SearchForSeasonState,
  StateType,
  UserSeasonsState,
  UserProfileState,
  SeasonMenuState,
  SeasonMeetsState,
  AthletesMenuState,
} from "../../types/states";
import Option from "../../types/Option";

import getUserSeasons from "../../firestore/getUserSeasons";

import getUserName from "../../firestore/getUserName";

import { SeasonSummary } from "../../types/misc";
import { SharedControllerMethods } from "../../types/controllers";
import doesUserHaveWriteAccessToSeason from "../../firestore/doesUserHaveWriteAccessToSeason";
import getSeasonMeets from "../../firestore/getSeasonMeets";
import getSeasonGradeBounds from "../../firestore/getSeasonGradeBounds";
import getSeasonAthletes from "../../firestore/getSeasonAthletes";
import getSeasonRaceDivisions from "../../firestore/getSeasonRaceDivisions";

export default function getSharedControllerMethods(
  app: App
): SharedControllerMethods {
  return {
    navigateToSearchForSeasonScreen() {
      app.newScreen<SearchForSeasonState>({
        kind: StateType.SearchForSeason,
        user: app.getUser(),
        query: "",
        isLoading: false,
        seasons: Option.none(),
      });
    },
    navigateToSignInScreen() {
      app.setState({
        kind: StateType.SignIn,
      });
    },
    navigateToUserSeasonsScreen() {
      app.getUser().match({
        none: () => {
          throw new Error(
            "Attempted to navigateToUserSeasonsScreen when user was not signed in."
          );
        },
        some: user => {
          app.newScreen<UserSeasonsState>({
            kind: StateType.UserSeasons,
            user,
            seasons: Option.none(),
          });
          getUserSeasons(user).then(seasonSummaries => {
            if (app.state.kind === StateType.UserSeasons) {
              app.setState({
                ...app.state,
                seasons: Option.some(seasonSummaries),
              });
            }
          });
        },
      });
    },
    navigateToUserProfileScreen() {
      app
        .newScreen<UserProfileState>({
          kind: StateType.UserProfile,
          user: app
            .getUser()
            .expect(
              "Attempted to navigateToUserProfileScreen when user was not signed in."
            ),
          fullName: Option.none(),
        })
        .update((state, updateScreen) => {
          getUserName(state.user).then(profile => {
            updateScreen({ fullName: Option.some(profile) });
          });
        });
    },
    viewSeason(seasonSummary: SeasonSummary) {
      app.newScreen<SeasonMenuState>({
        kind: StateType.SeasonMenu,
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
        .newScreen<AthletesMenuState>({
          kind: StateType.AthletesMenu,
          user,
          doesUserHaveWriteAccess: userHasAccessToSeason.unwrapOr(false),
          seasonSummary: seasonSummary,
          athletes: Option.none(),
          athleteFilter: {
            grade: Option.none(),
            gender: Option.none(),
            school: Option.none(),
          },
          raceDivisions: Option.none(),
          shouldSortByLastName: false,
          pendingAthleteEdit: Option.none(),
          pendingEditsBeingSyncedWithFirestore: [],
          consideredAthleteDeletion: Option.none(),
          isSpreadsheetDataShown: false,
        })
        .update((_state, updateScreen) => {
          const seasonId = seasonSummary.id;

          userHasAccessToSeason.ifNone(() => {
            user.ifSome(user => {
              doesUserHaveWriteAccessToSeason(user, seasonId).then(
                hasAccess => {
                  if (hasAccess) {
                    app.setState(prevState => ({
                      ...prevState,
                      doesUserHaveWriteAccess: true,
                    }));
                  }
                }
              );
            });
          });

          Promise.all([
            getSeasonAthletes(seasonId),
            getSeasonRaceDivisions(seasonId),
          ]).then(([athletes, filterOptions]) => {
            updateScreen({
              athletes: Option.some(athletes),
              raceDivisions: Option.some(filterOptions),
            });
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
      app.newScreen<SeasonMeetsState>({
        kind: StateType.SeasonMeets,

        user,
        doesUserHaveWriteAccess: false,
        seasonSummary,
        meets: Option.none(),
        gradeBounds: Option.none(),
        pendingMeetName: "",
      });

      const seasonId = seasonSummary.id;
      user.ifSome(user => {
        doesUserHaveWriteAccessToSeason(user, seasonId).then(hasAccess => {
          if (hasAccess && app.state.kind === StateType.SeasonMeets) {
            app.setState({ ...app.state, doesUserHaveWriteAccess: true });
          }
        });
      });
      getSeasonMeets(seasonId).then(meets => {
        if (app.state.kind === StateType.SeasonMeets) {
          app.setState({ ...app.state, meets: Option.some(meets) });
        }
      });
      getSeasonGradeBounds(seasonId).then(gradeBounds => {
        if (app.state.kind === StateType.SeasonMeets) {
          app.setState({
            ...app.state,
            gradeBounds: Option.some(gradeBounds),
          });
        }
      });
    },
  };
}
