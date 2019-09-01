import App from "../../App";

import {
  SharedControllerMethods,
  SeasonMenuController,
} from "../../types/controllers";

import {
  StateType,
  AthletesMenuState,
  SeasonMeetsState,
} from "../../types/states";
import Option from "../../types/Option";

import doesUserHaveWriteAccessToSeason from "../../firestore/doesUserHaveWriteAccessToSeason";

import getSeasonAthletes from "../../firestore/getSeasonAthletes";

import getSeasonAthleteFilterOptions from "../../firestore/getSeasonAthleteFilterOptions";

import getSeasonMeets from "../../firestore/getSeasonMeets";

export default function getSeasonMenuController(
  app: App,
  {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
  }: SharedControllerMethods
): SeasonMenuController {
  return {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu() {
      if (app.state.kind === StateType.SeasonMenu) {
        app.transitionScreens<AthletesMenuState>({
          kind: StateType.AthletesMenu,
          user: app.state.user,
          doesUserHaveWriteAccess: false,
          seasonSummary: app.state.seasonSummary,
          athletes: Option.none(),
          athleteFilter: {
            grade: Option.none(),
            gender: Option.none(),
            school: Option.none(),
          },
          athleteFilterOptions: Option.none(),
          shouldSortByLastName: false,
          pendingAthleteEdit: Option.none(),
          pendingEditsBeingSyncedWithFirestore: [],
          athleteConsideredForDeletion: Option.none(),
        });

        const seasonId = app.state.seasonSummary.id;
        app.state.user.ifSome(user => {
          doesUserHaveWriteAccessToSeason(user, seasonId).then(hasAccess => {
            if (hasAccess) {
              app.setState(prevState => ({
                ...prevState,
                doesUserHaveWriteAccess: true,
              }));
            }
          });
        });
        Promise.all([
          getSeasonAthletes(seasonId),
          getSeasonAthleteFilterOptions(seasonId),
        ]).then(([athletes, filterOptions]) => {
          if (app.state.kind === StateType.AthletesMenu) {
            app.setState(prevState => ({
              ...prevState,
              athletes: Option.some(athletes),
              athleteFilterOptions: Option.some(filterOptions),
            }));
          }
        });
      } else {
        throw new Error(
          "Attempted to navigateToAthletesMenu when user was not on SeasonMenu screen."
        );
      }
    },
    navigateToAssistantsMenu() {
      throw new Error("TODO navigateToAssistantsMenu");
    },
    navigateToSeasonMeetsScreen() {
      if (app.state.kind === StateType.SeasonMenu) {
        app.transitionScreens<SeasonMeetsState>({
          kind: StateType.SeasonMeets,

          user: app.state.user,
          doesUserHaveWriteAccess: false,
          seasonSummary: app.state.seasonSummary,
          meets: Option.none(),
          pendingMeetName: "",
        });

        const seasonId = app.state.seasonSummary.id;
        app.state.user.ifSome(user => {
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
      } else {
        throw new Error(
          "Attempted to navigateToMeetsMenu when user was not on SeasonMenu screen."
        );
      }
    },
  };
}
