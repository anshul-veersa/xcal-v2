export function arrayToMap<K extends PropertyKey, T>(
  items: Array<T>,
  keySelector: (item: T, index: number) => K
): Partial<Record<K, T>> {
  const map: Partial<Record<K, T>> = {};
  items.forEach((item, i) => {
    const key = keySelector(item, i);
    map[key] = item;
  });
  return map;
}
