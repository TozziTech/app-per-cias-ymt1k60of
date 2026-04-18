migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      const existing = app.findAuthRecordByEmail('_pb_users_auth_', 'tozziengenharia@hotmail.com')
      // Ensure the existing user has the correct admin role
      if (existing.getString('role') !== 'admin') {
        existing.set('role', 'admin')
        app.save(existing)
      }
      return // Already seeded
    } catch (_) {
      // Record does not exist, proceed to create
    }

    const record = new Record(users)
    record.setEmail('tozziengenharia@hotmail.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Admin')
    record.set('role', 'admin')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'tozziengenharia@hotmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
