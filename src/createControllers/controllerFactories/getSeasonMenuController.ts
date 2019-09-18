import App from "../../App";

import {
  SharedControllerMethods,
  SeasonMenuController,
} from "../../types/controllers";

import {
  StateType,
  AssistantsMenuState,
  SeasonMenuState,
} from "../../types/states";
import Option from "../../types/Option";

import getSeasonOwnerAndAssistants from "../../firestore/getSeasonOwnerAndAssistants";

import getUserSeasonPermissions from "../../firestore/getUserSeasonPermissions";

export default function getSeasonMenuController(
  app: App,
  {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu,
    navigateToSeasonMeetsScreen,
  }: SharedControllerMethods
): SeasonMenuController {
  return {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu() {
      const state = app.state as SeasonMenuState;
      navigateToAthletesMenu(state.user, state.seasonSummary, Option.none());
    },
    navigateToAssistantsMenu() {
      const state = app.state as SeasonMenuState;
      app
        .newScreenOLD<AssistantsMenuState>({
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
      alert("Sorry, meets have been temporarily disabled.");
      // if (app.state.kind === StateType.SeasonMenu) {
      //   navigateToSeasonMeetsScreen({
      //     user: app.state.user,
      //     seasonSummary: app.state.seasonSummary,
      //   });
      // } else {
      //   throw new Error(
      //     "Attempted to navigateToMeetsMenu when user was not on SeasonMenu screen."
      //   );
      // }
    },
  };
}
