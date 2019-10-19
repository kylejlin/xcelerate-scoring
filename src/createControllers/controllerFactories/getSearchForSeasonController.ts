import { StateType } from "../../types/states";
import {
  SearchForSeasonController,
  SharedControllerMethods,
} from "../../types/controllers";
import Option from "../../types/Option";
import searchForSeason from "../../firestore/searchForSeason";
import { ScreenGuarantee } from "../../types/handle";

export default function getSearchForSeasonController(
  { getCurrentScreen }: ScreenGuarantee<StateType.SearchForSeason>,
  {
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    viewSeason,
  }: SharedControllerMethods
): SearchForSeasonController {
  return {
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    editQuery(event: React.ChangeEvent<HTMLInputElement>) {
      const screen = getCurrentScreen();
      screen.update({ query: event.target.value });
    },
    search() {
      const screen = getCurrentScreen();
      screen.update({ isLoading: true });
      const originalQuery = screen.state.query;
      searchForSeason(originalQuery).then(seasonSummaries => {
        if (!screen.hasExpired()) {
          const possiblyUpdatedState = getCurrentScreen().state;
          if (
            possiblyUpdatedState.isLoading &&
            possiblyUpdatedState.query === originalQuery
          ) {
            screen.update({
              isLoading: false,
              seasons: Option.some(seasonSummaries),
            });
          }
        }
      });
    },
    viewSeason,
  };
}
