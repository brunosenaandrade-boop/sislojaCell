import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '../../superadmin/route-utils'
import { emailService } from '@/services/email/resend'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logApiError } from '@/lib/server-logger'

// ============================================
// POST /api/auth/cadastro
// Cadastro self-service com auto-confirmação de email
// ============================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TRIAL_DAYS = 7

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 cadastros por minuto por IP
    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'cadastro', limit: 5, windowSeconds: 60 })
    if (!rl.success) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 })
    }

    const body = await request.json()
    console.log('[Cadastro] Recebido:', JSON.stringify({ ...body, senha: '***' }))

    const {
      nomeEmpresa,
      nomeFantasia,
      cnpj,
      telefone,
      whatsapp,
      nomeUsuario,
      email,
      senha,
      codigoIndicacao,
    } = body as {
      nomeEmpresa: string
      nomeFantasia?: string
      cnpj?: string
      telefone?: string
      whatsapp?: string
      nomeUsuario: string
      email: string
      senha: string
      codigoIndicacao?: string
    }

    if (!nomeEmpresa || !nomeUsuario || !email || !senha) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nomeEmpresa, nomeUsuario, email, senha' },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      )
    }

    console.log('[Cadastro] Etapa 1: Criando serviceClient...')
    const serviceClient = getServiceClient()

    // 1. Criar usuário no Supabase Auth com auto-confirmação
    console.log('[Cadastro] Etapa 1: Criando auth user para', email)
    const { data: authData, error: authError } =
      await serviceClient.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
      })

    if (authError) {
      console.error('[Cadastro] ERRO Etapa 1 (auth):', authError.message)
      if (authError.message.includes('already been registered') || authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Este email já está cadastrado' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    if (!authData.user) {
      console.error('[Cadastro] ERRO Etapa 1: authData.user é null')
      return NextResponse.json(
        { error: 'Erro ao criar conta de autenticação' },
        { status: 500 }
      )
    }

    console.log('[Cadastro] Etapa 1 OK: auth_id =', authData.user.id)

    // 2. Criar empresa com trial
    const trialFim = new Date()
    trialFim.setDate(trialFim.getDate() + TRIAL_DAYS)

    console.log('[Cadastro] Etapa 2: Criando empresa...')
    const { data: empresa, error: empresaError } = await serviceClient
      .from('empresas')
      .insert({
        nome: nomeEmpresa,
        nome_fantasia: nomeFantasia || nomeEmpresa,
        cnpj: cnpj || null,
        telefone: whatsapp || telefone || null,
        whatsapp: whatsapp || null,
        email,
        cor_primaria: '#2563eb',
        cor_secundaria: '#1e40af',
        plano: 'free',
        status_assinatura: 'trial',
        trial_fim: trialFim.toISOString(),
        meses_bonus: 0,
        onboarding_completo: false,
      })
      .select()
      .single()

    if (empresaError) {
      console.error('[Cadastro] ERRO Etapa 2 (empresa):', empresaError.message, empresaError.code, empresaError.details)
      // Rollback: apagar usuário auth criado
      await serviceClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: empresaError.message }, { status: 500 })
    }

    console.log('[Cadastro] Etapa 2 OK: empresa_id =', empresa.id)

    // 3. Criar usuário admin vinculado à empresa
    console.log('[Cadastro] Etapa 3: Criando usuario admin...')
    const { data: usuario, error: usuarioError } = await serviceClient
      .from('usuarios')
      .insert({
        auth_id: authData.user.id,
        empresa_id: empresa.id,
        nome: nomeUsuario,
        email,
        perfil: 'admin',
        telefone: whatsapp || telefone || null,
      })
      .select()
      .single()

    if (usuarioError) {
      console.error('[Cadastro] ERRO Etapa 3 (usuario):', usuarioError.message, usuarioError.code, usuarioError.details)
      // Rollback
      await serviceClient.from('empresas').delete().eq('id', empresa.id)
      await serviceClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: usuarioError.message }, { status: 500 })
    }

    console.log('[Cadastro] Etapa 3 OK: usuario_id =', usuario.id)

    // 4. Auto-setup: configurações + categorias padrão
    // Se falhar, não faz rollback (conta funciona sem defaults)
    console.log('[Cadastro] Etapa 4: Criando defaults...')
    try {
      const { error: configErr } = await serviceClient.from('configuracoes').insert({
        empresa_id: empresa.id,
        impressora_termica: true,
        largura_cupom: 80,
        proxima_os: 1,
        proxima_venda: 1,
        mensagem_cupom: 'Obrigado pela preferência!',
        mensagem_os_entrada: 'Guarde este comprovante.',
        config_json: {},
      })
      if (configErr) console.warn('[Cadastro] Etapa 4 WARN (configuracoes):', configErr.message)

      const { error: catProdErr } = await serviceClient.from('categorias_produtos').insert([
        { empresa_id: empresa.id, nome: 'Acessórios' },
        { empresa_id: empresa.id, nome: 'Peças' },
        { empresa_id: empresa.id, nome: 'Capas' },
        { empresa_id: empresa.id, nome: 'Carregadores' },
        { empresa_id: empresa.id, nome: 'Fones de Ouvido' },
      ])
      if (catProdErr) console.warn('[Cadastro] Etapa 4 WARN (cat_produtos):', catProdErr.message)

      const { error: catServErr } = await serviceClient.from('categorias_servicos').insert([
        { empresa_id: empresa.id, nome: 'Celular' },
        { empresa_id: empresa.id, nome: 'Videogame' },
        { empresa_id: empresa.id, nome: 'Tablet' },
      ])
      if (catServErr) console.warn('[Cadastro] Etapa 4 WARN (cat_servicos):', catServErr.message)

      console.log('[Cadastro] Etapa 4 OK')
    } catch (defaultsErr) {
      console.warn('[Cadastro] Etapa 4 ERRO (defaults):', defaultsErr instanceof Error ? defaultsErr.message : defaultsErr)
    }

    // 5. Se foi indicada, registrar indicação
    console.log('[Cadastro] Etapa 5: Indicação...')
    if (codigoIndicacao) {
      const { data: empresaOrigem } = await serviceClient
        .from('empresas')
        .select('id, cnpj, email')
        .eq('codigo_indicacao', codigoIndicacao)
        .single()

      if (empresaOrigem) {
        const isSelf = empresaOrigem.id === empresa.id
        const sameEmail = empresaOrigem.email === email
        const sameCnpj = !!(cnpj && empresaOrigem.cnpj && empresaOrigem.cnpj === cnpj)

        if (!isSelf && !sameEmail && !sameCnpj) {
          const { data: existente } = await serviceClient
            .from('indicacoes')
            .select('id')
            .eq('empresa_indicada_id', empresa.id)
            .maybeSingle()

          if (!existente) {
            await serviceClient.from('indicacoes').insert({
              empresa_origem_id: empresaOrigem.id,
              empresa_indicada_id: empresa.id,
              codigo_indicacao: codigoIndicacao,
              status: 'pendente',
              data_cadastro_indicado: new Date().toISOString(),
            })
          }
        }
      }
    }

    // 6. Email de boas-vindas (fire-and-forget)
    console.log('[Cadastro] Etapa 6: Enviando email de boas-vindas...')
    emailService
      .boasVindas(email, nomeFantasia || nomeEmpresa)
      .catch((emailErr) => {
        console.warn('[Cadastro] Etapa 6 WARN (email):', emailErr instanceof Error ? emailErr.message : emailErr)
      })

    console.log('[Cadastro] SUCESSO: Cadastro completo para', email)
    return NextResponse.json({
      usuario,
      empresa,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    const stack = err instanceof Error ? err.stack : undefined
    console.error('[Cadastro] ERRO GERAL:', msg)
    if (stack) console.error('[Cadastro] Stack:', stack)
    await logApiError('/api/auth/cadastro', 'POST', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
