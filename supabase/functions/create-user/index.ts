import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Não autorizado')

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) throw new Error('Não autorizado')

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const isAdmin = ['Administrador', 'administrador', 'Gerente', 'Gestor'].includes(
      profile?.role || '',
    )

    if (!isAdmin) throw new Error('Sem permissão para realizar esta ação')

    const { email, password, name, role } = await req.json()
    if (!email) throw new Error('Email é obrigatório')

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: password || 'SenhaSegura123!',
      email_confirm: true,
      user_metadata: {
        name: name || '',
        role: role || 'Perito Associado',
      },
    })

    if (createError) {
      if (createError.message.includes('already exists') || createError.status === 422) {
        return new Response(JSON.stringify({ success: true, message: 'Usuário já existe' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
      throw createError
    }

    return new Response(JSON.stringify({ success: true, user: newUser.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
