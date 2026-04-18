migrate(
  (app) => {
    try {
      const messages = app.findCollectionByNameOrId('messages')
      app.delete(messages)
    } catch (_) {}

    try {
      const conversations = app.findCollectionByNameOrId('conversations')
      app.delete(conversations)
    } catch (_) {}
  },
  (app) => {
    const conversations = new Collection({
      name: 'conversations',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
          minSelect: 0,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(conversations)

    const messages = new Collection({
      name: 'messages',
      type: 'base',
      listRule: "@request.auth.id != '' && conversation.user = @request.auth.id",
      viewRule: "@request.auth.id != '' && conversation.user = @request.auth.id",
      createRule:
        "@request.auth.id != '' && conversation.user = @request.auth.id && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'conversation',
          type: 'relation',
          required: true,
          collectionId: conversations.id,
          cascadeDelete: false,
          maxSelect: 1,
          minSelect: 0,
        },
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
          minSelect: 0,
        },
        { name: 'content', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['usuario', 'assistente'],
          maxSelect: 1,
        },
        {
          name: 'attachment',
          type: 'file',
          required: false,
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: [],
          thumbs: [],
          protected: false,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(messages)
  },
)
