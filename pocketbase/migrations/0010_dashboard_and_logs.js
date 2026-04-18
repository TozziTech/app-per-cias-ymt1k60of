migrate(
  (app) => {
    const dashboardConfigs = new Collection({
      name: 'user_dashboard_configs',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'layout_data', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_user_dashboard_configs_user ON user_dashboard_configs (user)',
      ],
    })
    app.save(dashboardConfigs)

    const errorLogs = new Collection({
      name: 'error_logs',
      type: 'base',
      listRule: null,
      viewRule: null,
      createRule: '',
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'user',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: false,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'form_id', type: 'text' },
        { name: 'field_name', type: 'text' },
        { name: 'error_type', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(errorLogs)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('user_dashboard_configs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('error_logs'))
    } catch (_) {}
  },
)
