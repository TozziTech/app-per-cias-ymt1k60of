routerAdd('OPTIONS', '/backend/v1/chat/gemini', (e) => {
  const headers = e.response.header()
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return e.noContent(204)
})
