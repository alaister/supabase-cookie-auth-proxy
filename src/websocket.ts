export async function websocket(url: string) {
  const resp = await fetch(url, {
    headers: {
      Upgrade: 'websocket',
    },
  })

  const ws = resp.webSocket
  if (!ws) {
    throw new Error("server didn't accept WebSocket")
  }

  return ws
}
