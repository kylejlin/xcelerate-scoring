import {
  SharedControllerMethods,
  ViewMeetController,
} from "../../types/controllers";
import { StateType } from "../../types/states";
import { RaceDivisionUtil } from "../../types/race";
import Option from "../../types/Option";
import { AthleteOrSchool } from "../../types/misc";
import { ScreenGuarantee } from "../../types/handle";

export default function getViewMeetController(
  { getCurrentScreen }: ScreenGuarantee<StateType.ViewMeet>,
  {
    navigateToSignInScreen,
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToSeasonMeetsScreen,
  }: SharedControllerMethods
): ViewMeetController {
  return {
    navigateToSignInScreen,
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    back() {
      const { user, seasonSummary } = getCurrentScreen().state;
      navigateToSeasonMeetsScreen({ user, seasonSummary });
    },
    selectDivision(event: React.ChangeEvent<HTMLSelectElement>) {
      const screen = getCurrentScreen();
      const division = RaceDivisionUtil.parse(event.target.value);
      screen.update({ viewedDivision: Option.some(division) });
    },
    selectResultType(event: React.ChangeEvent<HTMLSelectElement>) {
      const screen = getCurrentScreen();
      const viewedResultType = event.target.value as AthleteOrSchool;
      screen.update({ viewedResultType });
    },
  };
}
