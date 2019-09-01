import App from "../../App";
import {
  SharedControllerMethods,
  UserProfileController,
} from "../../types/controllers";
import firebase from "../../firebase";
import { StateType } from "../../types/states";
import updateUserName from "../../firestore/updateUserName";
import createUserAccount from "../../firestore/createUserAccount";

export default function getUserProfileController(
  app: App,
  {
    navigateToUserSeasonsScreen,
    navigateToSearchForSeasonScreen,
  }: SharedControllerMethods
): UserProfileController {
  return {
    navigateToUserSeasonsScreen,
    signOut() {
      firebase
        .auth()
        .signOut()
        .then(navigateToSearchForSeasonScreen);
    },
    editPendingFirstName(event: React.ChangeEvent) {
      if (app.state.kind === StateType.UserProfile) {
        const newFirstName = (event.target as HTMLInputElement).value;
        app.setState({
          ...app.state,
          fullName: app.state.fullName.map(prevName => ({
            firstName: newFirstName,
            lastName: prevName.lastName,
          })),
        });
      } else {
        throw new Error(
          "Attempted to editPendingFirstName when user was not on UserProfile screen."
        );
      }
    },
    editPendingLastName(event: React.ChangeEvent) {
      if (app.state.kind === StateType.UserProfile) {
        const newLastName = (event.target as HTMLInputElement).value;
        app.setState({
          ...app.state,
          fullName: app.state.fullName.map(prevName => ({
            firstName: prevName.firstName,
            lastName: newLastName,
          })),
        });
      } else {
        throw new Error(
          "Attempted to editPendingLastName when user was not on UserProfile screen."
        );
      }
    },
    savePendingName() {
      if (app.state.kind === StateType.UserProfile) {
        const { user } = app.state;
        app.state.fullName.ifSome(fullName => {
          updateUserName(user, fullName).catch(() =>
            createUserAccount(user, fullName)
          );
        });
      } else {
        throw new Error(
          "Attempted to savePendingName when user was not on UserProfile screen."
        );
      }
    },
  };
}
