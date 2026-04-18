migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    try {
      const existing = app.findAuthRecordByEmail('users', 'tozziengenharia@hotmail.com')
      existing.setPassword('Skip@Pass')
      app.save(existing)
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('tozziengenharia@hotmail.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Admin')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'tozziengenharia@hotmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
