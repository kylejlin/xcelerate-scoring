import {
  AssistantsMenuController,
  SharedControllerMethods,
} from "../../types/controllers";
import App from "../../App";
import { AssistantsMenuState, StateType } from "../../types/states";
import { UserAccount } from "../../types/misc";
import Option from "../../types/Option";
import addAssistantToSeason from "../../firestore/addAssistantToSeason";
import deleteAssistantFromSeason from "../../firestore/deleteAssistantFromSeason";
import searchForUser from "../../firestore/searchForUser";

export default function getSeasonsMeetsController(
  app: App,
  {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    viewSeason,
  }: SharedControllerMethods
): AssistantsMenuController {
  return {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    back() {
      const state = app.state as AssistantsMenuState;
      viewSeason(state.seasonSummary);
    },
    deleteAssistant(assistantId: string) {
      app
        .updateScreen(StateType.AssistantsMenu, state => state)
        .update((state, updateScreen) => {
          deleteAssistantFromSeason(assistantId, state.seasonSummary.id).then(
            () => {
              updateScreen(prevState => ({
                assistants: prevState.assistants.map(assistants =>
                  assistants.filter(assistant => assistant.id !== assistantId)
                ),
              }));
            }
          );
        });
    },
    editAssistantQuery(event: React.ChangeEvent) {
      const assistantQuery = (event.target as HTMLInputElement).value;
      const state = app.state as AssistantsMenuState;
      app.setState({ ...state, assistantQuery });
    },
    search() {
      app
        .updateScreen(StateType.AssistantsMenu, () => ({
          areQueryResultsLoading: true,
        }))
        .update((state, updateScreen) => {
          const originalQuery = state.assistantQuery;
          if (originalQuery !== "") {
            searchForUser(originalQuery).then(userAccounts => {
              if (
                app.state.kind === StateType.AssistantsMenu &&
                app.state.areQueryResultsLoading &&
                app.state.assistantQuery === originalQuery
              ) {
                updateScreen({
                  areQueryResultsLoading: false,
                  queryResults: Option.some(userAccounts),
                });
              }
            });
          }
        });
    },
    addAssistant(assistant: UserAccount) {
      app
        .updateScreen(StateType.AssistantsMenu, state => state)
        .update((state, updateScreen) => {
          addAssistantToSeason(assistant.id, state.seasonSummary.id).then(
            () => {
              updateScreen(prevState => ({
                assistants: prevState.assistants.map(assistants =>
                  assistants.concat(assistant)
                ),
              }));
            }
          );
        });
    },
  };
}
