migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'tozziengenharia@hotmail.com')
    } catch (_) {
      user = new Record(users)
      user.setEmail('tozziengenharia@hotmail.com')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Tozzi Engenharia')
      app.save(user)
    }

    const convs = app.findCollectionByNameOrId('conversations')
    let conv
    try {
      conv = app.findFirstRecordByData('conversations', 'title', 'Análise de Estrutura Inicial')
    } catch (_) {
      conv = new Record(convs)
      conv.set('user', user.id)
      conv.set('title', 'Análise de Estrutura Inicial')
      app.save(conv)

      const msgs = app.findCollectionByNameOrId('messages')

      const msg1 = new Record(msgs)
      msg1.set('conversation', conv.id)
      msg1.set('user', user.id)
      msg1.set('content', 'Olá, preciso de ajuda com uma perícia de estrutura.')
      msg1.set('type', 'usuario')
      app.save(msg1)

      const msg2 = new Record(msgs)
      msg2.set('conversation', conv.id)
      msg2.set('user', user.id)
      msg2.set(
        'content',
        'Olá! Sou seu assistente virtual. Como posso ajudar com a análise de estrutura?',
      )
      msg2.set('type', 'assistente')
      app.save(msg2)
    }
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'tozziengenharia@hotmail.com')
      app.delete(user)
    } catch (_) {}
  },
)
