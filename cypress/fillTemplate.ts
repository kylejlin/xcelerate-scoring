/**
 * Replaces placeholders in a JSON template object with the provided replacements.
 *
 * A template may have two types of placeholders: substring placeholders (in the form of
 * `%myVarName`) and free placeholders (in the form of `"%%myVarName"`).
 *
 * All instances of `"...%myVarName..."` are replaced with `"...<provided replacement for %myVarName>..."`.
 *
 * All instances of `"%%myVarName"` are replaced with `<provided replacement for %%myVarName>`.
 *
 * @param src The template object
 * @param replacements A map of placeholders to replacements
 */
export default function fillTemplate(
  src: any,
  replacements: { [key: string]: any }
): any {
  const originalTxt = JSON.stringify(src);

  const substringPlaceholders = getSubstringPlaceholders(originalTxt);
  const freePlaceholders = getFreePlaceholders(originalTxt);
  const requiredPlaceholders = union(substringPlaceholders, freePlaceholders);
  const providedReplacements = new Set(Object.keys(replacements));

  if (!aEqB(requiredPlaceholders, providedReplacements)) {
    throw new TypeError(
      "You provided too many or too few placeholder replacements."
    );
  }

  const withSubstringPlaceholdersReplaced = Array.from(
    substringPlaceholders
  ).reduce((prevTxt, placeholder) => {
    const replacement = replacements[placeholder];
    return prevTxt.replace(new RegExp("%" + placeholder, "g"), replacement);
  }, originalTxt);

  const withAllPlaceholdersReplaced = Array.from(freePlaceholders).reduce(
    (prevTxt, placeholder) => {
      const replacement = replacements[placeholder];
      return prevTxt.replace(
        new RegExp('"%%' + placeholder + '"', "g"),
        JSON.stringify(replacement)
      );
    },
    withSubstringPlaceholdersReplaced
  );

  return JSON.parse(withAllPlaceholdersReplaced);
}

function getSubstringPlaceholders(originalTxt: string): Set<string> {
  const placeholders = originalTxt.match(/%\w+/) || [];
  return new Set(placeholders.map(x => x.slice(1)));
}

function getFreePlaceholders(originalTxt: string): Set<string> {
  const placeholders = originalTxt.match(/"%%\w+"/) || [];
  return new Set(placeholders.map(x => x.slice(3, -1)));
}

function aEqB<T>(a: Set<T>, b: Set<T>): boolean {
  const aVals = Array.from(a);
  const bVals = Array.from(b);

  return (
    aVals.every(aVal => bVals.includes(aVal)) &&
    bVals.every(bVal => aVals.includes(bVal))
  );
}

function union<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set(Array.from(a).concat(Array.from(b)));
}
