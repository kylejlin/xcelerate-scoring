import {
  SharedControllerMethods,
  UserProfileController,
} from "../../types/controllers";
import firebase from "../../firebase";
import { StateType } from "../../types/states";
import updateUserName from "../../firestore/updateUserName";
import createUserAccount from "../../firestore/createUserAccount";
import { ScreenGuarantee } from "../../types/handle";

export default function getUserProfileController(
  { getCurrentScreen }: ScreenGuarantee<StateType.UserProfile>,
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
    editPendingFirstName(event: React.ChangeEvent<HTMLInputElement>) {
      const screen = getCurrentScreen();
      const newFirstName = event.target.value;
      screen.update({
        fullName: screen.state.fullName.map(prevName => ({
          firstName: newFirstName,
          lastName: prevName.lastName,
        })),
      });
    },
    editPendingLastName(event: React.ChangeEvent<HTMLInputElement>) {
      const screen = getCurrentScreen();
      const newLastName = event.target.value;
      screen.update({
        fullName: screen.state.fullName.map(prevName => ({
          firstName: prevName.firstName,
          lastName: newLastName,
        })),
      });
    },
    savePendingName() {
      const screen = getCurrentScreen();
      const { user, fullName } = screen.state;
      fullName.ifSome(fullName => {
        updateUserName(user, fullName).catch(() =>
          createUserAccount(user, fullName)
        );
      });
    },
  };
}
