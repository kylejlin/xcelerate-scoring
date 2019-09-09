import getUserSeasonPermissions from "./getUserSeasonPermissions";

export default function doesUserHaveWriteAccessToSeason(
  user: firebase.User,
  seasonId: string
): Promise<boolean> {
  return getUserSeasonPermissions(user, seasonId).then(
    permissions => permissions.hasWriteAccess
  );
}
