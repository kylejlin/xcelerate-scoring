import * as functions from "firebase-functions";

const { HttpsError } = functions.https;
type CallableContext = functions.https.CallableContext;

export default function getUidOrThrow(ctx: CallableContext): string {
  if (ctx.auth === undefined) {
    throw new HttpsError(
      "unauthenticated",
      "You need to sign in to edit this season."
    );
  } else {
    return ctx.auth.uid;
  }
}
