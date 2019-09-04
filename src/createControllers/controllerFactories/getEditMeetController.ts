import {
  EditMeetController,
  SharedControllerMethods,
} from "../../types/controllers";
import App from "../../App";
import { StateType } from "../../types/states";
import {
  RaceAction,
  RaceActionKind,
  RaceDivisionUtil,
  Delete as RaceActionDelete,
} from "../../types/race";
import appendAction from "../../firestore/appendAction";
import Option from "../../types/Option";

export default function getEditMeetController(
  app: App,
  {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    viewSeason,
  }: SharedControllerMethods
): EditMeetController {
  return {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    back() {
      throw new Error("TODO back");
    },
    selectDivision(event: React.ChangeEvent) {
      const { value } = event.target as HTMLInputElement;
      const division = RaceDivisionUtil.parse(value);
      app.updateScreen(StateType.EditMeet, () => ({
        editedDivision: Option.some(division),
      }));
    },
    editPendingAthleteId(event: React.ChangeEvent) {
      const newPendingId = (event.target as HTMLInputElement).value;

      app.updateScreen(StateType.EditMeet, state => {
        if (isPartialId(newPendingId)) {
          if (newPendingId.length < 5) {
            return { pendingAthleteId: newPendingId };
          } else {
            const action: RaceAction = state.insertionIndex.match({
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
            const editedDivision = state.editedDivision.expect(
              "Attempted to appendDigitToPendingAthleteId when user has not selected division to edit."
            );
            appendAction(
              state.seasonSummary.id,
              state.meetSummary.id,
              editedDivision,
              action
            );
            return { pendingAthleteId: "" };
          }
        } else {
          return state;
        }
      });
    },
    setInsertionIndex(insertionIndex: Option<number>) {
      app.updateScreen(StateType.EditMeet, () => ({ insertionIndex }));
    },
    deleteAthlete(athleteId: string) {
      app.updateScreen(StateType.EditMeet, state => {
        const action: RaceActionDelete = {
          kind: RaceActionKind.Delete,
          athleteId,
        };
        const editedDivision = state.editedDivision.expect(
          "Attempted to appendDigitToPendingAthleteId when user has not selected division to edit."
        );
        appendAction(
          state.seasonSummary.id,
          state.meetSummary.id,
          editedDivision,
          action
        );
        return state;
      });
    },
  };
}

function isPartialId(string: string): boolean {
  return /^\d{0,5}$/.test(string);
}
