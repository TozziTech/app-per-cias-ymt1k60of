migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('pericias')

    let marianaId = null
    try {
      const mariana = app.findAuthRecordByEmail('_pb_users_auth_', 'mariana@firma.com.br')
      marianaId = mariana.id
    } catch (e) {}

    const seedPericia = (num, vara, cidade) => {
      try {
        app.findFirstRecordByData('pericias', 'numero_processo', num)
      } catch (_) {
        const record = new Record(col)
        record.set('numero_processo', num)
        record.set('vara', vara)
        record.set('cidade', cidade)
        if (marianaId) {
          record.set('perito_id', marianaId)
        }
        app.save(record)
      }
    }

    seedPericia('0001234-56.2024.8.26.0100', 'Vara Cível', 'São Paulo')
    seedPericia('0005678-90.2024.8.26.0200', 'Vara Cível', 'Rio de Janeiro')
  },
  (app) => {},
)
