export const concat = (...args: (string | number)[]) => args.join('');
export const fn =
  (fn: Function, ...args: unknown[]) =>
  () =>
    fn(...args);
