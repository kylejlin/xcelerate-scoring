export function zeroPadToFiveDigits(numberOrString: number | string): string {
  const str = "" + numberOrString;
  if (str.length <= 5) {
    const missingDigits = 5 - str.length;
    return "0".repeat(missingDigits) + str;
  } else {
    throw new Error(
      "Attempted to zeroPadToFiveDigits a number that was " +
        str.length +
        " digits."
    );
  }
}
