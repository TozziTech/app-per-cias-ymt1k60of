routerAdd('OPTIONS', '/backend/v1/chat-gemini', (e) => {
  e.response.header().set('Access-Control-Allow-Origin', '*')
  e.response.header().set('Access-Control-Allow-Headers', 'authorization, apikey, content-type')
  e.response.header().set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  return e.noContent(204)
})
