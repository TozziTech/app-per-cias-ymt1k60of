migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('pericia_mensagens')
    if (!col.fields.getByName('tipo_mensagem')) {
      col.fields.add(
        new SelectField({
          name: 'tipo_mensagem',
          values: ['usuario', 'assistente'],
          maxSelect: 1,
        }),
      )
    }
    app.save(col)
  },
  (app) => {},
)
