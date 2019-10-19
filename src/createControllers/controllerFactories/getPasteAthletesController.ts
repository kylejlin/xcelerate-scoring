import {
  SharedControllerMethods,
  PasteAthletesController,
} from "../../types/controllers";

import { StateType } from "../../types/states";

import parseSpreadsheetData from "../../parseSpreadsheetData";

import Option from "../../types/Option";
import { ScreenGuarantee } from "../../types/handle";
import getSeason from "../../firestore/getSeason";

export default function getPasteAthletesController(
  { getCurrentScreen }: ScreenGuarantee<StateType.PasteAthletes>,
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
      const { state } = getCurrentScreen();
      navigateToAthletesMenu(
        Option.some(state.user),
        state.seasonSummary,
        Option.some(true)
      );
    },
    editSpreadsheetData(event: React.ChangeEvent) {
      const screen = getCurrentScreen();
      const spreadsheetData = (event.target as HTMLInputElement).value;
      screen.update({ spreadsheetData });
    },
    editSchool(event: React.ChangeEvent) {
      const screen = getCurrentScreen();
      const schoolValue = (event.target as HTMLInputElement).value;
      const selectedSchool: Option<string> =
        schoolValue === "" ? Option.none() : Option.some(schoolValue);
      screen.update({ selectedSchool });
    },
    submitSpreadsheetData() {
      const screen = getCurrentScreen();
      const {
        user,
        seasonSummary,
        spreadsheetData,
        selectedSchool,
      } = screen.state;
      screen
        .pushScreen(StateType.AddAthletes, {
          user: user,
          seasonSummary: seasonSummary,
          wereAthletesPasted: true,
          athletes: parseSpreadsheetData(spreadsheetData, selectedSchool),
          pendingAthleteEdit: Option.none(),
          raceDivisions: Option.none(),
          areAthletesBeingAdded: false,
        })
        .then(screen => {
          getSeason(screen.state.seasonSummary.id).then(season => {
            screen.update({ raceDivisions: Option.some(season) });
          });
        });
    },
  };
}
