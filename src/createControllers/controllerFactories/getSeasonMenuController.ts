import App from "../../App";

import {
  SharedControllerMethods,
  SeasonMenuController,
} from "../../types/controllers";

import {
  StateType,
  AthletesMenuState,
  AssistantsMenuState,
  SeasonMenuState,
} from "../../types/states";
import Option from "../../types/Option";

import doesUserHaveWriteAccessToSeason from "../../firestore/doesUserHaveWriteAccessToSeason";

import getSeasonAthletes from "../../firestore/getSeasonAthletes";

import getSeasonAthleteFilterOptions from "../../firestore/getSeasonRaceDivisions";

import getSeasonOwnerAndAssistants from "../../firestore/getSeasonOwnerAndAssistants";

import getUserSeasonPermissions from "../../firestore/getUserSeasonPermissions";

export default function getSeasonMenuController(
  app: App,
  {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToSeasonMeetsScreen,
  }: SharedControllerMethods
): SeasonMenuController {
  return {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu() {
      if (app.state.kind === StateType.SeasonMenu) {
        app.newScreen<AthletesMenuState>({
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
          raceDivisions: Option.none(),
          shouldSortByLastName: false,
          pendingAthleteEdit: Option.none(),
          pendingEditsBeingSyncedWithFirestore: [],
          consideredAthleteDeletion: Option.none(),
          isSpreadsheetDataShown: false,
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
              raceDivisions: Option.some(filterOptions),
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
      const state = app.state as SeasonMenuState;
      app
        .newScreen<AssistantsMenuState>({
          kind: StateType.AssistantsMenu,

          user: state.user,
          doesUserHaveWriteAccess: false,
          isUserOwner: false,
          seasonSummary: state.seasonSummary,
          owner: Option.none(),
          assistants: Option.none(),
          assistantQuery: "",
          queryResults: Option.none(),
          areQueryResultsLoading: false,
        })
        .update((state, updateScreen) => {
          getSeasonOwnerAndAssistants(state.seasonSummary.id).then(
            ([owner, assistants]) => {
              updateScreen({
                owner: Option.some(owner),
                assistants: Option.some(assistants),
              });
            }
          );
          state.user.ifSome(user => {
            getUserSeasonPermissions(user, state.seasonSummary.id).then(
              permissions => {
                updateScreen({
                  isUserOwner: permissions.isOwner,
                  doesUserHaveWriteAccess: permissions.hasWriteAccess,
                });
              }
            );
          });
        });
    },
    navigateToSeasonMeetsScreen() {
      if (app.state.kind === StateType.SeasonMenu) {
        navigateToSeasonMeetsScreen({
          user: app.state.user,
          seasonSummary: app.state.seasonSummary,
        });
      } else {
        throw new Error(
          "Attempted to navigateToMeetsMenu when user was not on SeasonMenu screen."
        );
      }
    },
  };
}
