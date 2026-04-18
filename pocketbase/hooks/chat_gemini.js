routerAdd('POST', '/backend/v1/chat-gemini', (e) => {
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

  const authRecord = e.auth
  if (!authRecord) {
    return e.json(401, { error: 'Usuário não autenticado' })
  }

  const body = e.requestInfo().body || {}
  const conversa_id = body.conversa_id
  const mensagem = body.mensagem

  if (!conversa_id || !mensagem) {
    return e.json(400, { error: 'ID da conversa e mensagem são obrigatórios.' })
  }

  try {
    const messagesCol = $app.findCollectionByNameOrId('messages')

    const userMsg = new Record(messagesCol)
    userMsg.set('conversation', conversa_id)
    userMsg.set('user', authRecord.id)
    userMsg.set('content', mensagem)
    userMsg.set('type', 'usuario')
    $app.save(userMsg)

    const apiKey = $secrets.get('GEMINI_API_KEY') || ''

    const res = $http.send({
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: mensagem }] }],
      }),
      timeout: 30,
    })

    if (res.statusCode !== 200) {
      return e.json(503, { error: 'Erro ao se comunicar com o serviço de IA.' })
    }

    const resData = res.json
    const respostaText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!respostaText) {
      return e.json(503, { error: 'Erro ao se comunicar com o serviço de IA.' })
    }

    const asstMsg = new Record(messagesCol)
    asstMsg.set('conversation', conversa_id)
    asstMsg.set('user', authRecord.id)
    asstMsg.set('content', respostaText)
    asstMsg.set('type', 'assistente')
    $app.save(asstMsg)

    return e.json(200, { data: { resposta: respostaText } })
  } catch (err) {
    return e.json(503, { error: 'Erro ao se comunicar com o serviço de IA.' })
  }
})
