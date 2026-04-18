routerAdd(
  'POST',
  '/backend/v1/chat/gemini',
  (e) => {
    e.response.header().set('Access-Control-Allow-Origin', '*')
    e.response.header().set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    e.response.header().set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    const authRecord = e.auth
    if (!authRecord) {
      return e.unauthorizedError('Usuário não autenticado')
    }

    const body = e.requestInfo().body || {}
    const conversa_id = body.conversationId
    const mensagem = body.message

    if (!conversa_id || !mensagem) {
      return e.badRequestError('ID da conversa e mensagem são obrigatórios.')
    }

    try {
      const messagesCol = $app.findCollectionByNameOrId('messages')
      const apiKey = $secrets.get('GEMINI_API_KEY') || ''

      if (!apiKey) {
        return e.internalServerError('Chave da API do Gemini não configurada.')
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
        return e.internalServerError(
          'Erro ao se comunicar com o serviço de IA. Status: ' + res.statusCode,
        )
      }

      const resData = res.json
      const respostaText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || ''

      if (!respostaText) {
        return e.internalServerError('Resposta vazia ou inválida do serviço de IA.')
      }

      const asstMsg = new Record(messagesCol)
      asstMsg.set('conversation', conversa_id)
      asstMsg.set('user', authRecord.id)
      asstMsg.set('content', respostaText)
      asstMsg.set('type', 'assistente')
      $app.save(asstMsg)

      return e.json(200, { data: { resposta: respostaText } })
    } catch (err) {
      console.log('Hook Exception:', err)
      return e.internalServerError('Erro interno no processamento da requisição.')
    }
  },
  $apis.requireAuth(),
)
