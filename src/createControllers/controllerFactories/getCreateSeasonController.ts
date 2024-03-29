import {
  SharedControllerMethods,
  CreateSeasonController,
} from "../../types/controllers";

import { StateType, CreateSeasonState } from "../../types/states";

import { api } from "../../api";
import { SeasonSpec } from "../../types/misc";
import { ScreenGuarantee } from "../../types/handle";

export default function getCreateSeasonController(
  { getCurrentScreen }: ScreenGuarantee<StateType.CreateSeason>,
  { navigateToUserSeasonsScreen }: SharedControllerMethods
): CreateSeasonController {
  return {
    navigateToUserSeasonsScreen,
    editSeasonName(event: React.ChangeEvent<HTMLInputElement>) {
      const screen = getCurrentScreen();
      const seasonName = event.target.value;
      screen.update({ seasonName });
    },
    editPendingMinGrade(event: React.ChangeEvent<HTMLInputElement>) {
      const screen = getCurrentScreen();
      const minGrade = event.target.value;
      screen.update({ minGrade });
    },
    editPendingMaxGrade(event: React.ChangeEvent<HTMLInputElement>) {
      const screen = getCurrentScreen();
      const maxGrade = (event.target as HTMLInputElement).value;
      screen.update({ maxGrade });
    },
    validatePendingGrades() {
      const screen = getCurrentScreen();
      const [minGrade, maxGrade] = validatePendingGrades(
        screen.state.minGrade,
        screen.state.maxGrade
      );
      screen.update({
        minGrade: "" + minGrade,
        maxGrade: "" + maxGrade,
      });
    },
    editNewSchoolName(event: React.ChangeEvent<HTMLInputElement>) {
      const screen = getCurrentScreen();
      const newSchoolName = event.target.value;
      screen.update({ newSchoolName });
    },
    addNewSchool() {
      const screen = getCurrentScreen();
      const { schools, newSchoolName } = screen.state;
      if (!schools.includes(newSchoolName) && /\S/.test(newSchoolName)) {
        screen.update({
          schools: schools.concat([newSchoolName]),
          newSchoolName: "",
        });
      } else {
        screen.update({ newSchoolName: "" });
      }
    },
    deleteSchool(deletedSchool: string) {
      const screen = getCurrentScreen();
      const schools = screen.state.schools.filter(
        school => school !== deletedSchool
      );
      screen.update({ schools });
    },
    createSeason() {
      const screen = getCurrentScreen();
      screen.update({ isCreatingSeason: true });
      const spec = getSeasonSpec(screen.state);
      api.createSeason(spec).then(navigateToUserSeasonsScreen);
    },
  };
}

function validatePendingGrades(min: string, max: string): [number, number] {
  const minOrNaN = parseInt(min, 10);
  const maxOrNaN = parseInt(max, 10);
  const bound1 = isNaN(minOrNaN) ? DEFAULT_MIN_GRADE : minOrNaN;
  const bound2 = isNaN(maxOrNaN) ? DEFAULT_MAX_GRADE : maxOrNaN;
  const clampedBound1 = Math.max(1, bound1);
  const clampedBound2 = Math.max(1, bound2);
  const minGrade = Math.min(clampedBound1, clampedBound2);
  const maxGrade = Math.max(clampedBound1, clampedBound2);
  return [minGrade, maxGrade];
}

function getSeasonSpec(state: CreateSeasonState): SeasonSpec {
  const [minGrade, maxGrade] = validatePendingGrades(
    state.minGrade,
    state.maxGrade
  );
  return {
    name: state.seasonName,
    minGrade,
    maxGrade,
    schools: state.schools,
  };
}

const DEFAULT_MIN_GRADE = 6;
const DEFAULT_MAX_GRADE = 8;
