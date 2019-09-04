import App from "../../App";
import {
  UserSeasonsController,
  SharedControllerMethods,
} from "../../types/controllers";
import { StateType, CreateSeasonState } from "../../types/states";

export default function getUserSeasonsController(
  app: App,
  { navigateToUserProfileScreen, viewSeason }: SharedControllerMethods
): UserSeasonsController {
  return {
    navigateToUserProfileScreen,
    viewSeason,
    navigateToCreateSeasonScreen() {
      if (app.state.kind === StateType.UserSeasons) {
        app.newScreen<CreateSeasonState>({
          kind: StateType.CreateSeason,
          user: app.state.user,
          seasonName: "My Awesome Season",
          minGrade: "6",
          maxGrade: "8",
          schools: [],
          newSchoolName: "",
        });
      } else {
        throw new Error(
          "Attempted to navigateToCreateSeasonScreen when user was not on UserSeasons screen."
        );
      }
    },
  };
}