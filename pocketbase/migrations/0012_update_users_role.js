migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    const roleField = col.fields.getByName('role')

    if (roleField) {
      roleField.values = [
        'admin',
        'gerente',
        'perito',
        'assistente',
        'user',
        'Administrador',
        'Gestor',
        'Perito Associado',
      ]
    } else {
      col.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'gerente', 'perito', 'assistente', 'user'],
          maxSelect: 1,
        }),
      )
    }

    app.save(col)
  },
  (app) => {},
)
