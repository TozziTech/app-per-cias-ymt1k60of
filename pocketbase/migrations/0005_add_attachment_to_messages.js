migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('messages')
    col.fields.add(
      new FileField({
        name: 'attachment',
        maxSelect: 1,
        maxSize: 10485760,
        mimeTypes: ['application/pdf', 'text/plain'],
      }),
    )
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('messages')
    col.fields.removeByName('attachment')
    app.save(col)
  },
)
