migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('pericias')

    const addField = (field) => {
      if (!col.fields.getByName(field.name)) {
        col.fields.add(field)
      }
    }

    addField(new TextField({ name: 'vara' }))
    addField(new TextField({ name: 'cidade' }))
    addField(new TextField({ name: 'tipo_acao' }))
    addField(new TextField({ name: 'parte_autora' }))
    addField(new TextField({ name: 'parte_re' }))
    addField(new TextField({ name: 'assistente_tecnico' }))
    addField(new TextField({ name: 'perito_anterior' }))
    addField(new NumberField({ name: 'valor_proposto_anterior' }))
    addField(new NumberField({ name: 'valor_homologado' }))
    addField(new TextField({ name: 'endereco_objeto' }))
    addField(new TextField({ name: 'resumo_objeto' }))
    addField(
      new RelationField({ name: 'assistentes', collectionId: '_pb_users_auth_', maxSelect: 999 }),
    )

    const statusPagamento = col.fields.getByName('status_pagamento')
    if (statusPagamento && statusPagamento.type === 'text') {
      try {
        app
          .db()
          .newQuery('ALTER TABLE pericias RENAME COLUMN status_pagamento TO old_status_pagamento')
          .execute()
      } catch (e) {}
      col.fields.removeByName('status_pagamento')
      col.fields.add(
        new SelectField({
          name: 'status_pagamento',
          values: ['pendente', 'deposito_judicial', 'levantado'],
          maxSelect: 1,
        }),
      )
    } else if (!statusPagamento) {
      col.fields.add(
        new SelectField({
          name: 'status_pagamento',
          values: ['pendente', 'deposito_judicial', 'levantado'],
          maxSelect: 1,
        }),
      )
    }

    try {
      app
        .db()
        .newQuery(`
      DELETE FROM pericias WHERE id NOT IN (
        SELECT MIN(id) FROM pericias GROUP BY numero_processo
      ) AND numero_processo IS NOT NULL AND numero_processo != ''
    `)
        .execute()
    } catch (e) {}

    col.addIndex('idx_pericias_num_processo', true, 'numero_processo', "numero_processo != ''")

    col.listRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gerente' || perito_id = @request.auth.id || assistentes ~ @request.auth.id)"
    col.viewRule = col.listRule
    col.createRule = "@request.auth.id != ''"
    col.updateRule = col.listRule
    col.deleteRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gerente')"

    app.save(col)
  },
  (app) => {},
)
