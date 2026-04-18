routerAdd('POST', '/backend/v1/chat-gemini', (e) => {
  e.response.header().set('Access-Control-Allow-Origin', '*')

  const authRecord = e.auth
  if (!authRecord) {
    return e.unauthorizedError('Usuário não autenticado ou token inválido.')
  }

  const body = e.requestInfo().body || {}
  const periciaId = body.pericia_id
  const mensagem = body.mensagem

  if (!periciaId || !mensagem) {
    return e.badRequestError("Os campos 'pericia_id' e 'mensagem' são obrigatórios.")
  }

  try {
    const msgCollection = $app.findCollectionByNameOrId('pericia_mensagens')

    const apiKey = $secrets.get('GEMINI_API_KEY')
    if (!apiKey) {
      return e.json(503, {
        message:
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
        message:
          'O serviço de inteligência artificial está temporariamente indisponível. Por favor, tente novamente mais tarde.',
      })
    }

    const aiText =
      res.json?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Desculpe, não consegui processar sua solicitação.'

    const assistantMsg = new Record(msgCollection)
    assistantMsg.set('pericia_id', periciaId)
    assistantMsg.set('mensagem', aiText)
    assistantMsg.set('tipo_mensagem', 'assistente')
    $app.save(assistantMsg)

    return e.json(200, { data: { resposta: aiText } })
  } catch (err) {
    console.log('Error in chat-gemini:', err)
    return e.internalServerError('Ocorreu um erro interno no servidor.')
  }
})
