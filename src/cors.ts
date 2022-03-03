export function removeCors(response: Response) {
  response.headers.delete('access-control-allow-credentials')
  response.headers.delete('access-control-allow-headers')
  response.headers.delete('access-control-allow-methods')
  response.headers.delete('access-control-allow-origin')
}
