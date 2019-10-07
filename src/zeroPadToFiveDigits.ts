export default function zeroPadToFiveDigits(numOrStr: number | string): string {
  const str = numOrStr.toString();
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
