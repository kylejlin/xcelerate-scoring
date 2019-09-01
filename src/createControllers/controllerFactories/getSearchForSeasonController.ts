import App from "../../App";

import { SearchForSeasonState, StateType } from "../../types/states";
import {
  SearchForSeasonController,
  SharedControllerMethods,
} from "../../types/controllers";
import Option from "../../types/Option";
import searchForSeason from "../../firestore/searchForSeason";

export default function getSearchForSeasonController(
  app: App,
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
    editQuery(event: React.ChangeEvent) {
      app.setState({
        ...app.state,
        query: (event.target as HTMLInputElement).value,
      });
    },
    search() {
      const state = app.state as SearchForSeasonState;
      app.setState({ ...state, isLoading: true });
      const originalQuery = state.query;
      searchForSeason(originalQuery).then(seasonSummaries => {
        if (
          app.state.kind === StateType.SearchForSeason &&
          app.state.isLoading &&
          app.state.query === originalQuery
        ) {
          app.setState({
            ...state,
            isLoading: false,
            seasons: Option.some(seasonSummaries),
          });
        }
      });
    },
    viewSeason,
  };
}
