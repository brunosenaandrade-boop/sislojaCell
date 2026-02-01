import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '../../superadmin/route-utils'
import { emailService } from '@/services/email/resend'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

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
    const {
      nomeEmpresa,
      nomeFantasia,
      cnpj,
      telefone,
      nomeUsuario,
      email,
      senha,
      codigoIndicacao,
    } = body as {
      nomeEmpresa: string
      nomeFantasia?: string
      cnpj?: string
      telefone?: string
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

    const serviceClient = getServiceClient()

    // 1. Criar usuário no Supabase Auth com auto-confirmação
    const { data: authData, error: authError } =
      await serviceClient.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
      })

    if (authError) {
      if (authError.message.includes('already been registered') || authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Este email já está cadastrado' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao criar conta de autenticação' },
        { status: 500 }
      )
    }

    // 2. Criar empresa com trial
    const trialFim = new Date()
    trialFim.setDate(trialFim.getDate() + TRIAL_DAYS)

    const { data: empresa, error: empresaError } = await serviceClient
      .from('empresas')
      .insert({
        nome: nomeEmpresa,
        nome_fantasia: nomeFantasia || nomeEmpresa,
        cnpj: cnpj || null,
        telefone: telefone || null,
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
      // Rollback: apagar usuário auth criado
      await serviceClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: empresaError.message }, { status: 500 })
    }

    // 3. Criar usuário admin vinculado à empresa
    const { data: usuario, error: usuarioError } = await serviceClient
      .from('usuarios')
      .insert({
        auth_id: authData.user.id,
        empresa_id: empresa.id,
        nome: nomeUsuario,
        email,
        perfil: 'admin',
        telefone: telefone || null,
      })
      .select()
      .single()

    if (usuarioError) {
      // Rollback
      await serviceClient.from('empresas').delete().eq('id', empresa.id)
      await serviceClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: usuarioError.message }, { status: 500 })
    }

    // 4. Auto-setup: configurações + categorias padrão
    // Se falhar, não faz rollback (conta funciona sem defaults)
    try {
      await serviceClient.from('configuracoes').insert({
        empresa_id: empresa.id,
        impressora_termica: true,
        largura_cupom: 80,
        proxima_os: 1,
        proxima_venda: 1,
        mensagem_cupom: 'Obrigado pela preferência!',
        mensagem_os_entrada: 'Guarde este comprovante.',
        config_json: {},
      })

      await serviceClient.from('categorias_produtos').insert([
        { empresa_id: empresa.id, nome: 'Acessórios' },
        { empresa_id: empresa.id, nome: 'Peças' },
        { empresa_id: empresa.id, nome: 'Capas' },
        { empresa_id: empresa.id, nome: 'Carregadores' },
        { empresa_id: empresa.id, nome: 'Fones de Ouvido' },
      ])

      await serviceClient.from('categorias_servicos').insert([
        { empresa_id: empresa.id, nome: 'Celular' },
        { empresa_id: empresa.id, nome: 'Videogame' },
        { empresa_id: empresa.id, nome: 'Tablet' },
      ])
    } catch {
      // Defaults opcionais - conta funciona sem eles
      console.warn('[Cadastro] Erro ao criar defaults para empresa', empresa.id)
    }

    // 5. Se foi indicada, registrar indicação
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
    emailService
      .boasVindas(email, nomeFantasia || nomeEmpresa)
      .catch(() => {})

    return NextResponse.json({
      usuario,
      empresa,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
