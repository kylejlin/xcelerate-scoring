import { Api, ApiFnId } from ".";

class StubManager {
  private defaultImplementations: Api;
  private overrides: Partial<Api>;

  static fromDefaults(defaultImplementations: Api): StubManager {
    return new StubManager(defaultImplementations);
  }

  private constructor(defaultImplementations: Api) {
    this.defaultImplementations = defaultImplementations;
    this.overrides = {};
  }

  override<T extends ApiFnId>(id: T, implementation: Api[T]) {
    this.overrides[id] = implementation;
  }

  getImplementation<T extends ApiFnId>(id: T): Api[T] {
    const override = this.overrides[id] as (Api[T] | undefined);

    if (override === undefined) {
      return this.defaultImplementations[id];
    } else {
      return override;
    }
  }
}

export interface StubbableApi extends Api {
  getAllFunctionIds(): ApiFnId[];

  override<T extends ApiFnId>(id: T, implementation: Api[T]): void;
}

export function getStubbableApi(defaultImplementations: Api): StubbableApi {
  const manager = StubManager.fromDefaults(defaultImplementations);

  manager.override = manager.override.bind(manager);

  function getAllFunctionIds(): ApiFnId[] {
    return Object.keys(defaultImplementations) as ApiFnId[];
  }

  const wrappedApi = (Object.keys(
    defaultImplementations
  ) as (keyof Api)[]).reduce(
    (acc, key) => ({
      ...(acc as any),
      [key]: (...args: any[]): any => {
        return (manager.getImplementation(key) as any)(...args);
      },
    }),
    {}
  ) as Api;

  return { ...wrappedApi, getAllFunctionIds, override: manager.override };
}
