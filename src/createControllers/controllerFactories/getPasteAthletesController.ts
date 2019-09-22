import App from "../../App";

import {
  SharedControllerMethods,
  PasteAthletesController,
} from "../../types/controllers";

import {
  StateType,
  AddAthletesState,
  PasteAthletesState,
} from "../../types/states";

import getSeasonRaceDivisions from "../../firestore/getSeasonRaceDivisions";

import parseSpreadsheetData from "../../parseSpreadsheetData";

import Option from "../../types/Option";

export default function getPasteAthletesController(
  app: App,
  {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu,
  }: SharedControllerMethods
): PasteAthletesController {
  return {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu() {
      const state = app.state as PasteAthletesState;
      navigateToAthletesMenu(
        Option.some(state.user),
        state.seasonSummary,
        Option.some(true)
      );
    },
    editSpreadsheetData(event: React.ChangeEvent) {
      if (app.state.kind === StateType.PasteAthletes) {
        const spreadsheetData = (event.target as HTMLInputElement).value;
        app.setState({ ...app.state, spreadsheetData });
      } else {
        throw new Error(
          "Attempted to editSpreadsheetData when user was not on PasteAthletes screen."
        );
      }
    },
    editSchool(event: React.ChangeEvent) {
      if (app.state.kind === StateType.PasteAthletes) {
        const schoolValue = (event.target as HTMLInputElement).value;
        const selectedSchool: Option<string> =
          schoolValue === "" ? Option.none() : Option.some(schoolValue);
        app.setState({ ...app.state, selectedSchool });
      } else {
        throw new Error(
          "Attempted to editSchool when user was not on PasteAthletes screen."
        );
      }
    },
    submitSpreadsheetData() {
      if (app.state.kind === StateType.PasteAthletes) {
        app
          .newScreenOLD<AddAthletesState>({
            kind: StateType.AddAthletes,
            user: app.state.user,
            seasonSummary: app.state.seasonSummary,
            wereAthletesPasted: true,
            athletes: parseSpreadsheetData(
              app.state.spreadsheetData,
              app.state.selectedSchool
            ),
            pendingAthleteEdit: Option.none(),
            raceDivisions: Option.none(),
            areAthletesBeingAdded: false,
          })
          .update((state, updateScreen) => {
            getSeasonRaceDivisions(state.seasonSummary.id).then(
              raceDivisions => {
                updateScreen({ raceDivisions: Option.some(raceDivisions) });
              }
            );
          });
      } else {
        throw new Error(
          "Attempted to submitSpreadsheetData when user was not on PasteAthletes screen."
        );
      }
    },
  };
}
