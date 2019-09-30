import {
  UserSeasonsController,
  SharedControllerMethods,
} from "../../types/controllers";
import { StateType } from "../../types/states";
import { ScreenGuarantee } from "../../types/handle";

export default function getUserSeasonsController(
  { getCurrentScreen }: ScreenGuarantee<StateType.UserSeasons>,
  {
    navigateToSearchForSeasonScreen,
    navigateToUserProfileScreen,
    viewSeason,
  }: SharedControllerMethods
): UserSeasonsController {
  return {
    navigateToSearchForSeasonScreen,
    navigateToUserProfileScreen,
    viewSeason,
    navigateToCreateSeasonScreen() {
      const screen = getCurrentScreen();
      screen.pushScreen(StateType.CreateSeason, {
        user: screen.state.user,
        seasonName: "My Awesome Season",
        minGrade: "6",
        maxGrade: "8",
        schools: [],
        newSchoolName: "",
      });
    },
  };
}
