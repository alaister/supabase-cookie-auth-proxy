export class NotFoundError extends Error {}
export class UnauthenticatedError extends Error {}

export const DEFAULT_PAGE_SIZE = 20

export function getPagination(page?: number, size: number = DEFAULT_PAGE_SIZE) {
  const limit = size
  const from = page ? page * limit : 0
  const to = page ? from + size - 1 : size - 1

  return { from, to }
}
