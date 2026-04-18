routerAdd(
  'POST',
  '/backend/v1/chat/gemini',
  (e) => {
    const authRecord = e.auth
    if (!authRecord) {
      return e.json(401, { error: 'Usuário não autenticado' })
    }

    const body = e.requestInfo().body || {}
    const conversa_id = body.conversationId
    const mensagem = body.message

    if (!conversa_id || !mensagem) {
      return e.json(400, { error: 'ID da conversa e mensagem são obrigatórios.' })
    }

    try {
      const messagesCol = $app.findCollectionByNameOrId('messages')
      const apiKey = $secrets.get('GEMINI_API_KEY') || ''

      if (!apiKey) {
        return e.json(500, { error: 'Chave da API do Gemini não configurada.' })
      }

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
        timeout: 120,
      })

      if (res.statusCode !== 200) {
        console.log('Gemini API Error:', res.raw)
        return e.json(503, {
          error: 'Erro ao se comunicar com o serviço de IA. Status: ' + res.statusCode,
        })
      }

      const resData = res.json
      const respostaText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || ''

      if (!respostaText) {
        return e.json(503, { error: 'Resposta vazia ou inválida do serviço de IA.' })
      }

      const asstMsg = new Record(messagesCol)
      asstMsg.set('conversation', conversa_id)
      asstMsg.set('user', authRecord.id)
      asstMsg.set('content', respostaText)
      asstMsg.set('type', 'assistente')
      $app.save(asstMsg)

      e.response.header().set('Access-Control-Allow-Origin', '*')

      return e.json(200, { data: { resposta: respostaText } })
    } catch (err) {
      console.log('Hook Exception:', err)
      e.response.header().set('Access-Control-Allow-Origin', '*')
      return e.json(500, { error: 'Erro interno no processamento da requisição.' })
    }
  },
  $apis.requireAuth(),
)
