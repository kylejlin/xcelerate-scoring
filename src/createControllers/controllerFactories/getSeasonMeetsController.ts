import {
  SeasonMeetsController,
  SharedControllerMethods,
} from "../../types/controllers";
import { MeetSummary, AthleteOrSchool } from "../../types/misc";
import { RaceDivisionUtil, RaceUpdater, RaceDivision } from "../../types/race";
import { StateType } from "../../types/states";
import addMeetToSeason from "../../firestore/addMeetToSeason";
import getMeetRaces from "../../firestore/getMeetRaces";
import Option from "../../types/Option";
import openSeasonAthletesHandleUntil from "../../firestore/openSeasonAthletesHandleUntil";
import { ScreenGuarantee } from "../../types/handle";

export default function getSeasonsMeetsController(
  { getCurrentScreen }: ScreenGuarantee<StateType.SeasonMeets>,
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
      const screen = getCurrentScreen();
      screen
        .newScreen(StateType.ViewMeet, {
          user: screen.state.user,
          seasonSummary: screen.state.seasonSummary,
          meetSummary,
          races: Option.none(),
          viewedDivision: Option.none(),
          viewedResultType: AthleteOrSchool.Athlete,
          athletes: Option.none(),
        })
        .then(screen => {
          const { state } = screen;
          getMeetRaces(state.seasonSummary.id, state.meetSummary.id).then(
            races => {
              RaceUpdater.updateRacesUntil(races, screen.expiration).onUpdate(
                () => {
                  // TODO Dehackify
                  // Hack to force the app to update
                  // Since app.forceUpdate() cannot be called
                  screen.update({
                    seasonSummary: { ...screen.state.seasonSummary },
                  });
                }
              );
              const divisions = races.getDivisions();
              const viewedDivision =
                divisions.length === 0
                  ? Option.none<RaceDivision>()
                  : Option.some(divisions[0]);
              screen.update({ races: Option.some(races), viewedDivision });
            }
          );
          const { athletes } = openSeasonAthletesHandleUntil(
            state.seasonSummary.id,
            screen.expiration
          );
          athletes.onUpdate(athletes => {
            screen.update({ athletes: Option.some(athletes) });
          });
        });
    },
    editMeet(meetSummary: MeetSummary) {
      const screen = getCurrentScreen();
      screen
        .newScreen(StateType.EditMeet, {
          user: screen.state.user.expect(
            "Attempted to editMeet when user was not on SeasonMeets screen."
          ),
          seasonSummary: screen.state.seasonSummary,
          meetSummary,
          races: Option.none(),
          editedDivision: Option.none(),
          pendingAthleteId: "",
          insertionIndex: Option.none(),
          athletes: Option.none(),
          athleteIdWhichCouldNotBeInserted: Option.none(),
        })
        .then(screen => {
          const { state } = screen;

          getMeetRaces(state.seasonSummary.id, state.meetSummary.id).then(
            races => {
              RaceUpdater.updateRacesUntil(races, screen.expiration).onUpdate(
                () => {
                  // TODO Dehackify
                  // Hack to force the app to update
                  // Since app.forceUpdate() cannot be called
                  screen.update({
                    seasonSummary: { ...screen.state.seasonSummary },
                  });
                }
              );
              const divisions = races.getDivisions();
              const editedDivision =
                divisions.length === 0
                  ? Option.none<RaceDivision>()
                  : Option.some(divisions[0]);
              screen.update({ races: Option.some(races), editedDivision });
            }
          );
          const { athletes } = openSeasonAthletesHandleUntil(
            state.seasonSummary.id,
            screen.expiration
          );
          athletes.onUpdate(athletes => {
            screen.update({ athletes: Option.some(athletes) });
          });
        });
    },
    editPendingMeetName(event: React.ChangeEvent) {
      const screen = getCurrentScreen();
      const pendingMeetName = (event.target as HTMLInputElement).value;
      screen.update({ pendingMeetName });
    },
    addMeet() {
      const screen = getCurrentScreen();
      const { pendingMeetName } = screen.state;
      const gradeBounds = screen.state.gradeBounds.expect(
        "Attempted to addMeet when grade bounds have not yet loaded."
      );
      const divisions = RaceDivisionUtil.getDivisions(gradeBounds);
      if (pendingMeetName !== "") {
        screen.update({ pendingMeetName: "" });
        addMeetToSeason(
          pendingMeetName,
          screen.state.seasonSummary.id,
          divisions
        ).then(meetSummary => {
          screen.update({
            meets: screen.state.meets.map(meets => meets.concat([meetSummary])),
          });
        });
      }
    },
  };
}
