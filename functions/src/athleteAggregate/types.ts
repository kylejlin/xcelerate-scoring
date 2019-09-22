import { TeamsRecipe } from "../types/team";
import { Athlete } from "../types/athlete";

export interface Aggregate {
  lowestAvailableAthleteId: number;
  teams: TeamsRecipe;
  athletes: Athlete[];
}
