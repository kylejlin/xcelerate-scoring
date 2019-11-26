import { StubbableApi } from "../src/api/StubbableApi";

export default function disableAllApiFunctions(
  api: StubbableApi,
  onError: (err: Error) => void
): void {
  api.getAllFunctionIds().forEach(id => {
    api.override(id, function disabledApiFunction() {
      const err = new Error(
        "`api." + id + "()` has been disabled for testing."
      );

      onError(err);

      throw err;
    });
  });
}
