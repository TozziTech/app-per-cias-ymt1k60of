routerAdd('OPTIONS', '/backend/v1/chat-gemini', (e) => {
  const origin = e.request.header.get('Origin') || '*'

  e.response.header().set('Access-Control-Allow-Origin', origin)
  e.response.header().set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  e.response.header().set('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey')
  return e.noContent(204)
})
