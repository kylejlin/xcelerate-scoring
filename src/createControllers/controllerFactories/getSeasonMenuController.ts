import {
  SharedControllerMethods,
  SeasonMenuController,
} from "../../types/controllers";

import { StateType } from "../../types/states";
import Option from "../../types/Option";

import { api } from "../../api";

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
      const { user, season } = getCurrentScreen().state;
      navigateToAthletesMenu(user, season, Option.none());
    },
    navigateToAssistantsMenu() {
      const screen = getCurrentScreen();
      const { user, season } = screen.state;
      screen
        .pushScreen(StateType.AssistantsMenu, {
          user,
          doesUserHaveWriteAccess: false,
          isUserOwner: false,
          season,
          owner: Option.none(),
          assistants: Option.none(),
          assistantQuery: "",
          queryResults: Option.none(),
          areQueryResultsLoading: false,
        })
        .then(screen => {
          const { season, user } = screen.state;
          api
            .getSeasonOwnerAndAssistants(season.id)
            .then(([owner, assistants]) => {
              screen.update({
                owner: Option.some(owner),
                assistants: Option.some(assistants),
              });
            });
          user.ifSome(user => {
            api
              .getUserSeasonPermissions(user.uid, season.id)
              .then(permissions => {
                screen.update({
                  isUserOwner: permissions.isOwner,
                  doesUserHaveWriteAccess: permissions.hasWriteAccess,
                });
              });
          });
        });
    },
    navigateToSeasonMeetsScreen() {
      const { user, season } = getCurrentScreen().state;
      navigateToSeasonMeetsScreen({
        user,
        season,
      });
    },
  };
}
