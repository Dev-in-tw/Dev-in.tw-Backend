export function Omit<T, K extends keyof T>(
  Class: new () => T,
  keys: K[],
): new () => Omit<T, (typeof keys)[number]> {
  return Class;
}
