export default function generateRandomAlphaNumStr(len: number): string {
  let out = "";
  while (out.length < len) {
    out += Math.floor(36 * Math.random()).toString(36);
  }
  return out;
}
