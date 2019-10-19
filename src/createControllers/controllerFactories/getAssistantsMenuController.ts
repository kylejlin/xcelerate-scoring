import {
  AssistantsMenuController,
  SharedControllerMethods,
} from "../../types/controllers";
import { StateType } from "../../types/states";
import { UserAccount } from "../../types/misc";
import Option from "../../types/Option";
import addAssistantToSeason from "../../firestore/addAssistantToSeason";
import deleteAssistantFromSeason from "../../firestore/deleteAssistantFromSeason";
import searchForUser from "../../firestore/searchForUser";
import { ScreenGuarantee } from "../../types/handle";

export default function getAssistantsMenuController(
  { getCurrentScreen }: ScreenGuarantee<StateType.AssistantsMenu>,
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
      const screen = getCurrentScreen();
      viewSeason(screen.state.season);
    },
    deleteAssistant(assistantId: string) {
      const screen = getCurrentScreen();
      deleteAssistantFromSeason(
        assistantId,
        screen.state.season.id
      ).then(() => {
        screen.update(prevState => ({
          assistants: prevState.assistants.map(assistants =>
            assistants.filter(assistant => assistant.id !== assistantId)
          ),
        }));
      });
    },
    editAssistantQuery(event: React.ChangeEvent<HTMLInputElement>) {
      const assistantQuery = event.target.value;
      const screen = getCurrentScreen();
      screen.update({ assistantQuery });
    },
    search() {
      const screen = getCurrentScreen();
      screen.update({ areQueryResultsLoading: true });
      const originalQuery = screen.state.assistantQuery;
      if (originalQuery !== "") {
        searchForUser(originalQuery).then(userAccounts => {
          if (!screen.hasExpired()) {
            const possiblyUpdatedState = getCurrentScreen().state;
            if (
              possiblyUpdatedState.areQueryResultsLoading &&
              possiblyUpdatedState.assistantQuery === originalQuery
            ) {
              screen.update({
                areQueryResultsLoading: false,
                queryResults: Option.some(userAccounts),
              });
            }
          }
        });
      }
    },
    addAssistant(assistant: UserAccount) {
      const screen = getCurrentScreen();
      addAssistantToSeason(assistant.id, screen.state.season.id).then(
        () => {
          screen.update(prevState => ({
            assistants: prevState.assistants.map(assistants =>
              assistants.concat(assistant)
            ),
          }));
        }
      );
    },
  };
}
