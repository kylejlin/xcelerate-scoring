import {
  EditMeetController,
  SharedControllerMethods,
} from "../../types/controllers";
import { StateType } from "../../types/states";
import {
  RaceAction,
  RaceActionKind,
  RaceDivisionUtil,
  Delete as RaceActionDelete,
  getFinisherIds,
} from "../../types/race";
import appendAction from "../../firestore/appendAction";
import Option from "../../types/Option";
import { ScreenGuarantee } from "../../types/handle";

export default function getEditMeetController(
  { getCurrentScreen }: ScreenGuarantee<StateType.EditMeet>,
  {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToSeasonMeetsScreen,
  }: SharedControllerMethods
): EditMeetController {
  return {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    back() {
      const { state } = getCurrentScreen();
      navigateToSeasonMeetsScreen({
        user: Option.some(state.user),
        seasonSummary: state.seasonSummary,
      });
    },
    selectDivision(event: React.ChangeEvent) {
      const screen = getCurrentScreen();
      const { value } = event.target as HTMLInputElement;
      const division = RaceDivisionUtil.parse(value);
      screen.update({ editedDivision: Option.some(division) });
    },
    editPendingAthleteId(event: React.ChangeEvent) {
      const screen = getCurrentScreen();
      const newPendingIdStr = (event.target as HTMLInputElement).value;

      if (isPartialId(newPendingIdStr)) {
        if (newPendingIdStr.length < 5) {
          screen.update({ pendingAthleteId: newPendingIdStr });
        } else {
          screen.update({ pendingAthleteId: "" });

          const newPendingId = parseInt(newPendingIdStr, 10);

          const editedDivision = screen.state.editedDivision.expect(
            "Attempted to editPendingAthleteId before user selected a division to edit."
          );
          const divisionIndex = RaceDivisionUtil.getOrderedDivisions(
            screen.state.divisionsRecipe.expect(
              "Attempted to editPendingAthleteId before divisions recipe loaded."
            )
          ).findIndex(division =>
            RaceDivisionUtil.areDivisionsEqual(division, editedDivision)
          );
          const editedRace = screen.state.orderedRaces.expect(
            "Attempted to editPendingAthleteId before races loaded."
          )[divisionIndex];
          const finisherIds = getFinisherIds(editedRace);
          const athletes = screen.state.athletes.expect(
            "Attempted to editPendingAthleteId before athletes loaded."
          );
          const targetedAthlete = athletes.find(
            athlete => athlete.id === newPendingIdStr
          );

          if (
            targetedAthlete !== undefined &&
            RaceDivisionUtil.areDivisionsEqual(
              targetedAthlete,
              editedDivision
            ) &&
            !finisherIds.includes(newPendingId)
          ) {
            const { insertionIndex, seasonSummary, meetSummary } = screen.state;
            const action: RaceAction = insertionIndex.match({
              none: () => ({
                kind: RaceActionKind.InsertAtEnd,
                athleteId: newPendingId,
              }),
              some: insertionIndex => ({
                kind: RaceActionKind.InsertAbove,
                insertionIndex,
                athleteId: newPendingId,
              }),
            });
            appendAction(seasonSummary.id, meetSummary.id, action);
          } else {
            screen.update({
              athleteIdWhichCouldNotBeInserted: Option.some(newPendingIdStr),
            });
          }
        }
      }
    },
    setInsertionIndex(insertionIndex: Option<number>) {
      const screen = getCurrentScreen();
      screen.update({ insertionIndex });
    },
    deleteAthlete(athleteId: number) {
      const screen = getCurrentScreen();
      const { seasonSummary, meetSummary } = screen.state;
      const action: RaceActionDelete = {
        kind: RaceActionKind.Delete,
        athleteId,
      };
      appendAction(seasonSummary.id, meetSummary.id, action);
    },
    dismissInsertionErrorMessage() {
      const screen = getCurrentScreen();
      screen.update({
        athleteIdWhichCouldNotBeInserted: Option.none(),
      });
    },
  };
}

function isPartialId(string: string): boolean {
  return /^\d{0,5}$/.test(string);
}
