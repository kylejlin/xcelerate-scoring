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
          appendAction(seasonSummary.id, meetSummary.id, action).catch(err => {
            console.log("hi");
            if (isInsufficientPermissionsError(err)) {
              screen.update({
                athleteIdWhichCouldNotBeInserted: Option.some(newPendingIdStr),
              });
            } else {
              throw err;
            }
          });
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

function isInsufficientPermissionsError(err: Error): boolean {
  // Hacky, but I don't know a better way.
  return err.message.toLowerCase().includes("permission");
}
