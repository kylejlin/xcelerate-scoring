import {
  EditMeetController,
  SharedControllerMethods,
} from "../../types/controllers";
import App from "../../App";
import { StateType, EditMeetState } from "../../types/states";
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
      const state = app.state as EditMeetState;
      navigateToSeasonMeetsScreen({
        user: Option.some(state.user),
        seasonSummary: state.seasonSummary,
      });
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
            ).catch(err => {
              if (isInsufficientPermissionsError(err)) {
                app.updateScreen(StateType.EditMeet, () => ({
                  athleteIdWhichCouldNotBeInserted: Option.some(newPendingId),
                }));
              } else {
                throw err;
              }
            });
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
    dismissInsertionErrorMessage() {
      app.updateScreen(StateType.EditMeet, () => ({
        athleteIdWhichCouldNotBeInserted: Option.none(),
      }));
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
