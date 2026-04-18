migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const seedUser = (email, name, role) => {
      try {
        app.findAuthRecordByEmail('_pb_users_auth_', email)
      } catch (_) {
        const record = new Record(users)
        record.setEmail(email)
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('name', name)
        record.set('role', role)
        app.save(record)
      }
    }

    seedUser('ana@firma.com.br', 'Ana Silva', 'admin')
    seedUser('carlos@firma.com.br', 'Carlos Oliveira', 'gerente')
    seedUser('mariana@firma.com.br', 'Mariana Santos', 'perito')
    seedUser('tozziengenharia@hotmail.com', 'Admin Tozzi', 'admin')
  },
  (app) => {},
)
