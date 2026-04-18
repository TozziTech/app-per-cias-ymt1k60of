routerAdd('POST', '/backend/v1/chat-gemini', (e) => {
  e.response.header().set('Access-Control-Allow-Origin', '*')

  let authRecord = e.auth
  if (!authRecord) {
    const authHeader = e.request.header.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()
    if (token) {
      try {
        authRecord = $app.findAuthRecordByToken(token)
      } catch (_) {}
    }
  }

  if (!authRecord) {
    return e.json(401, { error: 'Usuário não autenticado ou token inválido.' })
  }

  const body = e.requestInfo().body || {}
  const periciaId = body.pericia_id || body.conversa_id
  const mensagem = body.mensagem

  if (!periciaId || !mensagem) {
    return e.json(400, {
      error: "Os campos 'pericia_id' (ou 'conversa_id') e 'mensagem' são obrigatórios.",
    })
  }

  try {
    const msgCollection = $app.findCollectionByNameOrId('pericia_mensagens')

    const userMsg = new Record(msgCollection)
    userMsg.set('pericia_id', periciaId)
    userMsg.set('user_id', authRecord.id)
    userMsg.set('mensagem', String(mensagem))
    userMsg.set('tipo_mensagem', 'usuario')
    $app.save(userMsg)

    const apiKey = $secrets.get('GEMINI_API_KEY')
    if (!apiKey) {
      return e.json(503, {
        error:
          'O serviço de inteligência artificial está temporariamente indisponível. Por favor, tente novamente mais tarde.',
      })
    }

    const res = $http.send({
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: String(mensagem) }] }],
      }),
      timeout: 30,
    })

    if (res.statusCode !== 200) {
      console.log('Gemini API Error', res.raw)
      return e.json(503, {
        error:
          'O serviço de inteligência artificial está temporariamente indisponível. Por favor, tente novamente mais tarde.',
      })
    }

    const aiText =
      res.json?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Desculpe, não consegui processar sua solicitação.'

    const assistantMsg = new Record(msgCollection)
    assistantMsg.set('pericia_id', periciaId)
    assistantMsg.set('user_id', authRecord.id)
    assistantMsg.set('mensagem', aiText)
    assistantMsg.set('tipo_mensagem', 'assistente')
    $app.save(assistantMsg)

    return e.json(200, { data: { resposta: aiText } })
  } catch (err) {
    console.log('Error in chat-gemini:', err)
    return e.json(500, { error: 'Ocorreu um erro interno no servidor.' })
  }
})
