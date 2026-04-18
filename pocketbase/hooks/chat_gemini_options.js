routerAdd('OPTIONS', '/backend/v1/chat/gemini', (e) => {
  return e.noContent(204)
})
