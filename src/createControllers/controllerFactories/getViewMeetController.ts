import {
  SharedControllerMethods,
  ViewMeetController,
} from "../../types/controllers";
import App from "../../App";
import { StateType, ViewMeetState } from "../../types/states";
import { RaceDivisionUtil } from "../../types/race";
import Option from "../../types/Option";
import { AthleteOrSchool } from "../../types/misc";

export default function getViewMeetController(
  app: App,
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
      const state = app.state as ViewMeetState;
      navigateToSeasonMeetsScreen({
        user: state.user,
        seasonSummary: state.seasonSummary,
      });
    },
    selectDivision(event: React.ChangeEvent) {
      const { value } = event.target as HTMLInputElement;
      const division = RaceDivisionUtil.parse(value);
      app.updateScreen(StateType.ViewMeet, () => ({
        viewedDivision: Option.some(division),
      }));
    },
    selectResultType(event: React.ChangeEvent) {
      const { value } = event.target as HTMLInputElement;
      const viewedResultType = value as AthleteOrSchool;
      app.updateScreen(StateType.ViewMeet, () => ({ viewedResultType }));
    },
  };
}
