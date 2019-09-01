import App from "../../App";

import {
  SearchForSeasonState,
  StateType,
  UserSeasonsState,
  UserProfileState,
  SeasonMenuState,
} from "../../types/states";
import Option from "../../types/Option";

import getUserSeasons from "../../firestore/getUserSeasons";

import getUserName from "../../firestore/getUserName";

import { SeasonSummary } from "../../types/misc";
import { SharedControllerMethods } from "../../types/controllers";

export default function getSharedControllerMethods(
  app: App
): SharedControllerMethods {
  return {
    navigateToSearchForSeasonScreen() {
      app.transitionScreens<SearchForSeasonState>({
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
          app.transitionScreens<UserSeasonsState>({
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
        .transitionScreens<UserProfileState>({
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
      app.transitionScreens<SeasonMenuState>({
        kind: StateType.SeasonMenu,
        user: app.getUser(),
        seasonSummary,
      });
    },
  };
}
