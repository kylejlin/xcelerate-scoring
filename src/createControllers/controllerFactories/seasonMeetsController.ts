import {
  SeasonMeetsController,
  SharedControllerMethods,
} from "../../types/controllers";
import App from "../../App";
import { MeetSummary } from "../../types/misc";
import { RaceDivisionUtil, RaceUpdater } from "../../types/race";
import { StateType, ViewMeetState, EditMeetState } from "../../types/states";
import addMeetToSeason from "../../firestore/addMeetToSeason";
import getMeetRaces from "../../firestore/getMeetRaces";
import Option from "../../types/Option";
import getSeasonAthletes from "../../firestore/getSeasonAthletes";

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
      if (app.state.kind === StateType.SeasonMeets) {
        app.newScreen<ViewMeetState>({
          kind: StateType.ViewMeet,

          user: app.state.user,
          seasonSummary: app.state.seasonSummary,
          meetSummary,
          races: Option.none(),
          viewedDivision: Option.none(),
        });
      } else {
        throw new Error(
          "Attempted to viewMeet when user was not on SeasonMeets screen."
        );
      }
      throw new Error("TODO viewMeet");
    },
    editMeet(meetSummary: MeetSummary) {
      if (app.state.kind === StateType.SeasonMeets) {
        app
          .newScreen<EditMeetState>({
            kind: StateType.EditMeet,

            user: app.state.user.expect(
              "Attempted to editMeet when user was not on SeasonMeets screen."
            ),
            seasonSummary: app.state.seasonSummary,
            meetSummary,
            races: Option.none(),
            editedDivision: Option.none(),
            pendingAthleteId: "",
            insertionIndex: Option.none(),
            athletes: Option.none(),
          })
          .update((state, updateScreen) => {
            getMeetRaces(state.seasonSummary.id, state.meetSummary.id).then(
              races => {
                const currentScreenNumber = state.screenNumber;
                RaceUpdater.updateRacesWhile(
                  races,
                  () => app.state.screenNumber === currentScreenNumber
                ).onUpdate(() => {
                  app.forceUpdate();
                });
                updateScreen({
                  races: Option.some(races),
                  editedDivision: Option.some(races.getDivisions()[0]),
                });
              }
            );
            getSeasonAthletes(state.seasonSummary.id).then(athletes => {
              updateScreen({ athletes: Option.some(athletes) });
            });
          });
      } else {
        throw new Error(
          "Attempted to editMeet when user was not on SeasonMeets screen."
        );
      }
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
        const gradeBounds = app.state.gradeBounds.expect(
          "Attempted to addMeet when grade bounds have not yet loaded."
        );
        const divisions = RaceDivisionUtil.getDivisions(gradeBounds);
        if (pendingMeetName !== "") {
          app.setState({ ...app.state, pendingMeetName: "" });
          addMeetToSeason(
            pendingMeetName,
            app.state.seasonSummary.id,
            divisions
          ).then(meetSummary => {
            if (app.state.kind === StateType.SeasonMeets) {
              app.setState({
                ...app.state,
                meets: app.state.meets.map(meets =>
                  meets.concat([meetSummary])
                ),
              });
            }
          });
        }
      } else {
        throw new Error(
          "Attempted to addMeet when user was not on SeasonMeets screen."
        );
      }
    },
  };
}
