import {
  SharedControllerMethods,
  SeasonMenuController,
} from "../../types/controllers";

import { StateType } from "../../types/states";
import Option from "../../types/Option";

import getSeasonOwnerAndAssistants from "../../firestore/getSeasonOwnerAndAssistants";

import getUserSeasonPermissions from "../../firestore/getUserSeasonPermissions";
import { ScreenGuarantee } from "../../types/handle";

export default function getSeasonMenuController(
  { getCurrentScreen }: ScreenGuarantee<StateType.SeasonMenu>,
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
      const { user, seasonSummary } = getCurrentScreen().state;
      navigateToAthletesMenu(user, seasonSummary, Option.none());
    },
    navigateToAssistantsMenu() {
      const screen = getCurrentScreen();
      const { user, seasonSummary } = screen.state;
      screen
        .newScreen(StateType.AssistantsMenu, {
          user,
          doesUserHaveWriteAccess: false,
          isUserOwner: false,
          seasonSummary,
          owner: Option.none(),
          assistants: Option.none(),
          assistantQuery: "",
          queryResults: Option.none(),
          areQueryResultsLoading: false,
        })
        .then(screen => {
          const { seasonSummary, user } = screen.state;
          getSeasonOwnerAndAssistants(seasonSummary.id).then(
            ([owner, assistants]) => {
              screen.update({
                owner: Option.some(owner),
                assistants: Option.some(assistants),
              });
            }
          );
          user.ifSome(user => {
            getUserSeasonPermissions(user, seasonSummary.id).then(
              permissions => {
                screen.update({
                  isUserOwner: permissions.isOwner,
                  doesUserHaveWriteAccess: permissions.hasWriteAccess,
                });
              }
            );
          });
        });
    },
    navigateToSeasonMeetsScreen() {
      const { user, seasonSummary } = getCurrentScreen().state;
      navigateToSeasonMeetsScreen({
        user,
        seasonSummary,
      });
    },
  };
}
