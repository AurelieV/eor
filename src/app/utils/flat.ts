export function flat<T>(arr: T[][]): T[] {
  return arr.reduce((acc, val) => acc.concat(val), [])
}

export function flatMap<T, F>(arr: T[][], fn: (t: T[], index: number) => F[]): F[] {
  return arr.reduce((acc, x, index) => acc.concat(fn(x, index)), [] as F[])
}
