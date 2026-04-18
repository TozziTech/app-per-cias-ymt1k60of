migrate(
  (app) => {
    const peritos = new Collection({
      name: 'peritos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(peritos)

    const pericias = new Collection({
      name: 'pericias',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'codigo_interno', type: 'text' },
        { name: 'numero_processo', type: 'text' },
        { name: 'vara', type: 'text' },
        { name: 'cidade', type: 'text' },
        { name: 'juiz', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'data_nomeacao', type: 'date' },
        { name: 'data_pericia', type: 'date' },
        { name: 'data_entrega_laudo', type: 'date' },
        { name: 'data_aceite', type: 'date' },
        { name: 'advogado_autora', type: 'text' },
        { name: 'advogado_re', type: 'text' },
        { name: 'assistente_autora', type: 'text' },
        { name: 'assistente_re', type: 'text' },
        { name: 'perito_associado', type: 'text' },
        { name: 'perito_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'honorarios', type: 'number' },
        { name: 'justica_gratuita', type: 'bool' },
        { name: 'status_pagamento', type: 'text' },
        { name: 'endereco', type: 'text' },
        { name: 'observacoes', type: 'text' },
        { name: 'link_nuvem', type: 'url' },
        { name: 'aceite', type: 'text' },
        { name: 'justificativa_recusa', type: 'text' },
        { name: 'prazo_entrega', type: 'date' },
        { name: 'entrega_impugnacao', type: 'date' },
        { name: 'entrega_esclarecimentos', type: 'date' },
        { name: 'descricao_impugnacao', type: 'text' },
        { name: 'data_impugnacao', type: 'date' },
        { name: 'dias_impugnacao', type: 'number' },
        { name: 'limites_esclarecimentos', type: 'text' },
        { name: 'honorarios_parcelados', type: 'bool' },
        { name: 'quantidade_parcelas', type: 'number' },
        { name: 'adiantamento_solicitado', type: 'bool' },
        { name: 'checklist', type: 'json' },
        { name: 'peticoes', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(pericias)

    const anexos_pericia = new Collection({
      name: 'anexos_pericia',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'pericia_id', type: 'relation', collectionId: pericias.id, maxSelect: 1 },
        { name: 'file', type: 'file', maxSelect: 1, maxSize: 52428800 },
        { name: 'file_name', type: 'text' },
        { name: 'size', type: 'number' },
        { name: 'created_by', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(anexos_pericia)

    const lancamentos = new Collection({
      name: 'lancamentos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'data', type: 'date' },
        { name: 'tipo', type: 'text' },
        { name: 'categoria', type: 'text' },
        { name: 'descricao', type: 'text' },
        { name: 'valor', type: 'number' },
        { name: 'pericia_id', type: 'relation', collectionId: pericias.id, maxSelect: 1 },
        { name: 'status', type: 'text' },
        { name: 'responsavel_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'recorrente', type: 'bool' },
        { name: 'frequencia_recorrencia', type: 'text' },
        { name: 'parcelas', type: 'number' },
        { name: 'anexo_url', type: 'url' },
        { name: 'anexo_nome', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(lancamentos)

    const historico_documentos = new Collection({
      name: 'historico_documentos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'tipo_documento', type: 'text' },
        { name: 'nome_documento', type: 'text' },
        { name: 'pericia_id', type: 'relation', collectionId: pericias.id, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(historico_documentos)

    const activity_logs = new Collection({
      name: 'activity_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'entity_id', type: 'text' },
        { name: 'entity_type', type: 'text' },
        { name: 'action', type: 'text' },
        { name: 'details', type: 'json' },
        { name: 'user_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(activity_logs)

    const captacao_pericias = new Collection({
      name: 'captacao_pericias',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'data_contato', type: 'date' },
        { name: 'nome_contato', type: 'text' },
        { name: 'instituicao', type: 'text' },
        { name: 'perito_id', type: 'relation', collectionId: peritos.id, maxSelect: 1 },
        { name: 'responsavel_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'telefone', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'status', type: 'text' },
        { name: 'data_retorno', type: 'date' },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(captacao_pericias)

    const pericia_mensagens = new Collection({
      name: 'pericia_mensagens',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'pericia_id', type: 'relation', collectionId: pericias.id, maxSelect: 1 },
        { name: 'user_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'mensagem', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(pericia_mensagens)

    const notificacoes = new Collection({
      name: 'notificacoes',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        { name: 'user_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'titulo', type: 'text' },
        { name: 'descricao', type: 'text' },
        { name: 'link', type: 'url' },
        { name: 'lida', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(notificacoes)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('notificacoes'))
    app.delete(app.findCollectionByNameOrId('pericia_mensagens'))
    app.delete(app.findCollectionByNameOrId('captacao_pericias'))
    app.delete(app.findCollectionByNameOrId('activity_logs'))
    app.delete(app.findCollectionByNameOrId('historico_documentos'))
    app.delete(app.findCollectionByNameOrId('lancamentos'))
    app.delete(app.findCollectionByNameOrId('anexos_pericia'))
    app.delete(app.findCollectionByNameOrId('pericias'))
    app.delete(app.findCollectionByNameOrId('peritos'))
  },
)
