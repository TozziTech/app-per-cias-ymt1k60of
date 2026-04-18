routerAdd('OPTIONS', '/backend/v1/chat-gemini', (e) => {
  const origin = e.request.header.get('Origin') || ''
  const allowedOrigins = [
    'https://app-pericias-08888--preview.goskip.app',
    'https://app-pericias-08888.goskip.app',
  ]

  if (allowedOrigins.includes(origin)) {
    e.response.header().set('Access-Control-Allow-Origin', origin)
  } else {
    e.response.header().set('Access-Control-Allow-Origin', '*')
  }

  e.response.header().set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  e.response.header().set('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey')
  return e.noContent(204)
})
