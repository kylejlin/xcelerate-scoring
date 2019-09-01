import {
  SeasonMeetsController,
  SharedControllerMethods,
} from "../../types/controllers";
import App from "../../App";
import { MeetSummary } from "../../types/misc";
import { StateType } from "../../types/states";
import addMeetToSeason from "../../firestore/addMeetToSeason";

export default function getSeasonsMeetsController(
  app: App,
  {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    viewSeason,
  }: SharedControllerMethods
): SeasonMeetsController {
  return {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    viewSeason,
    viewMeet(meetSummary: MeetSummary) {
      throw new Error("TODO viewMeet");
    },
    editMeet(meetSummary: MeetSummary) {
      throw new Error("TODO editMeet");
    },
    editPendingMeetName(event: React.ChangeEvent) {
      if (app.state.kind === StateType.SeasonMeets) {
        const pendingMeetName = (event.target as HTMLInputElement).value;
        app.setState({ ...app.state, pendingMeetName });
      } else {
        throw new Error(
          "Attempted to editPendingMeetName when user was not on SeasonMeets screen."
        );
      }
    },
    addMeet() {
      if (app.state.kind === StateType.SeasonMeets) {
        const { pendingMeetName } = app.state;
        if (pendingMeetName !== "") {
          app.setState({ ...app.state, pendingMeetName: "" });
          addMeetToSeason(pendingMeetName, app.state.seasonSummary.id).then(
            meetSummary => {
              if (app.state.kind === StateType.SeasonMeets) {
                app.setState({
                  ...app.state,
                  meets: app.state.meets.map(meets =>
                    meets.concat([meetSummary])
                  ),
                });
              }
            }
          );
        }
      } else {
        throw new Error(
          "Attempted to addMeet when user was not on SeasonMeets screen."
        );
      }
    },
  };
}
