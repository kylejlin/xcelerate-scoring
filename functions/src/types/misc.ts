export function isObject(x: unknown): x is UnknownObject {
  return "object" === typeof x && x !== null;
}

export type UnknownObject = { [key: string]: unknown };

export function isPositiveInt(n: unknown): n is number {
  return isInt(n) && n > 0;
}

export function isNonNegativeInt(n: unknown): n is number {
  return isInt(n) && n >= 0;
}

export function isInt(n: unknown): n is number {
  return n === parseInt("" + n, 10);
}
