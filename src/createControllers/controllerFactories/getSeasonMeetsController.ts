import {
  SeasonMeetsController,
  SharedControllerMethods,
} from "../../types/controllers";
import { MeetSummary, AthleteOrSchool } from "../../types/misc";
import { RaceDivision, RaceDivisionUtil } from "../../types/race";
import { StateType } from "../../types/states";
import { api } from "../../api";
import Option from "../../types/Option";
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
        .pushScreen(StateType.ViewMeet, {
          user: screen.state.user,
          season: screen.state.season,
          meetSummary,
          divisionsRecipe: Option.none(),
          orderedRaces: Option.none(),
          viewedDivision: Option.none(),
          viewedResultType: AthleteOrSchool.Athlete,
          athletes: Option.none(),
        })
        .then(screen => {
          const { state } = screen;

          const { meet, raceDivisions } = api.openMeetHandleUntil(
            state.season.id,
            state.meetSummary.id,
            screen.expiration
          );

          meet.onUpdate(meet => {
            screen.update({
              orderedRaces: Option.some(meet.divisionFinisherIds),
            });
          });

          raceDivisions.then(raceDivisions => {
            const orderedDivisions = RaceDivisionUtil.getOrderedDivisions(
              raceDivisions
            );
            const firstDivision: Option<RaceDivision> =
              orderedDivisions.length > 0
                ? Option.some(orderedDivisions[0])
                : Option.none();
            screen.update({
              divisionsRecipe: Option.some(raceDivisions),
              viewedDivision: firstDivision,
            });
          });

          const { athletes } = api.openSeasonAthletesHandleUntil(
            state.season.id,
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
        .pushScreen(StateType.EditMeet, {
          user: screen.state.user.expect(
            "Attempted to editMeet when user was not on SeasonMeets screen."
          ),
          season: screen.state.season,
          meetSummary,
          divisionsRecipe: Option.none(),
          orderedRaces: Option.none(),
          editedDivision: Option.none(),
          pendingAthleteId: "",
          insertionIndex: Option.none(),
          athletes: Option.none(),
          athleteIdWhichCouldNotBeInserted: Option.none(),
          pendingActions: [],
        })
        .then(screen => {
          const { state } = screen;

          const { meet, raceDivisions } = api.openMeetHandleUntil(
            state.season.id,
            state.meetSummary.id,
            screen.expiration
          );

          meet.onUpdate(meet => {
            screen.update({
              orderedRaces: Option.some(meet.divisionFinisherIds),
            });
          });

          raceDivisions.then(raceDivisions => {
            const orderedDivisions = RaceDivisionUtil.getOrderedDivisions(
              raceDivisions
            );
            const firstDivision: Option<RaceDivision> =
              orderedDivisions.length > 0
                ? Option.some(orderedDivisions[0])
                : Option.none();
            screen.update({
              divisionsRecipe: Option.some(raceDivisions),
              editedDivision: firstDivision,
            });
          });

          const { athletes } = api.openSeasonAthletesHandleUntil(
            state.season.id,
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
      if (pendingMeetName !== "") {
        screen.update({ pendingMeetName: "" });
        api
          .addMeetToSeason(pendingMeetName, screen.state.season.id)
          .then(meetSummary => {
            screen.update({
              meets: screen.state.meets.map(meets =>
                meets.concat([meetSummary])
              ),
            });
          });
      }
    },
  };
}
