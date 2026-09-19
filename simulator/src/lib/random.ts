// A random number between the minimum and the maximum (both reachable), rounded to the given decimals.
export const randomInRange = (minimum: number, maximum: number, decimals: number): number => {
  const scale = 10 ** decimals;
  return Math.round((minimum + Math.random() * (maximum - minimum)) * scale) / scale;
};
