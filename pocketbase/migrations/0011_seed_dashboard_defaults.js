migrate(
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'tozziengenharia@hotmail.com')
      const configs = app.findCollectionByNameOrId('user_dashboard_configs')
      try {
        app.findFirstRecordByData('user_dashboard_configs', 'user', user.id)
      } catch (_) {
        const record = new Record(configs)
        record.set('user', user.id)
        record.set('layout_data', [
          'kpis',
          'financial',
          'productivity',
          'perito',
          'ranking',
          'activities',
        ])
        app.save(record)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'tozziengenharia@hotmail.com')
      const record = app.findFirstRecordByData('user_dashboard_configs', 'user', user.id)
      app.delete(record)
    } catch (_) {}
  },
)
