export default function removeDuplicates<T>(arr: T[]): T[] {
  const uniqueItems: T[] = [];
  arr.forEach(item => {
    if (!uniqueItems.includes(item)) {
      uniqueItems.push(item);
    }
  });
  return uniqueItems;
}
