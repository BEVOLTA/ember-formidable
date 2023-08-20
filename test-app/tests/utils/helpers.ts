export const concat = (...args: string[]) => args.join('');
export const fn =
  (fn: Function, ...args: unknown[]) =>
  () =>
    fn(...args);
