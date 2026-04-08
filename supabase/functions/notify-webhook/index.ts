import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { type, record, table } = payload

    console.log(`[Webhook Triggered] Event Type: ${type} on table: ${table || 'pericias'}`)

    if (type === 'INSERT' && (!table || table === 'pericias')) {
      const peritoAssociado = record.perito_associado || record.peritoAssociado
      const processo = record.numero_processo || record.numeroProcesso

      console.log(`Nova nomeação registrada para o processo ${processo}.`)
      if (peritoAssociado) {
        // Here you would integrate with Resend, SendGrid, etc.
        console.log(
          `Email mock enviado para o perito: ${peritoAssociado} -> "Você foi atribuído a uma nova perícia (${processo})."`,
        )
      }
    } else if (table === 'tarefas' && type === 'INSERT') {
      const peritoAssociado = record.perito_associado_id
      console.log(`Nova tarefa registrada: ${record.titulo}`)
      if (peritoAssociado) {
        console.log(
          `[ALERTA EMAIL/PUSH] Email mock enviado para o perito ID: ${peritoAssociado} -> "Você foi atribuído a uma nova tarefa: ${record.titulo}."`,
        )
      }
    } else {
      console.log('Outro tipo de evento ignorado nesta function.')
    }

    return new Response(JSON.stringify({ success: true, message: 'Notification processed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
