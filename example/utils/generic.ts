export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : plural || singular + 's'
}

export function ensureArray<T>(data: T | T[]): T[] {
  return Array.isArray(data) ? data : [data]
}

export const firstStr = (arrOrStr?: string[] | string) =>
  arrOrStr ? ensureArray(arrOrStr)[0] ?? '' : ''
