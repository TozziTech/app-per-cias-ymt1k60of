migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('anexos_pericia')
    if (!col.fields.getByName('tipo_documento')) {
      col.fields.add(
        new SelectField({
          name: 'tipo_documento',
          values: ['peticao_inicial', 'contestacao', 'sentenca', 'outro'],
          maxSelect: 1,
        }),
      )
    }
    app.save(col)
  },
  (app) => {},
)
