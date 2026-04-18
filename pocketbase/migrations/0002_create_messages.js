migrate(
  (app) => {
    const convCollection = app.findCollectionByNameOrId('conversations')
    const collection = new Collection({
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
          collectionId: convCollection.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'content', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['usuario', 'assistente'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('messages')
    app.delete(collection)
  },
)
