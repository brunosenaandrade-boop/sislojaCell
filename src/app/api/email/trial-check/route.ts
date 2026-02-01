import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '../../superadmin/route-utils'
import { emailService } from '@/services/email/resend'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// ============================================
// POST /api/email/trial-check
// Verifica trials expirando/expirados e envia emails
// Deve ser chamado via cron (Vercel Cron ou externo)
// Header: x-cron-secret para autenticação
// ============================================

const CRON_SECRET = process.env.CRON_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests por minuto por IP
    const ip = getClientIp(request)
    const rl = rateLimit(ip, { id: 'trial-check', limit: 5, windowSeconds: 60 })
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Validar secret do cron (obrigatório em produção)
    const secret = request.headers.get('x-cron-secret') || request.headers.get('authorization')?.replace('Bearer ', '')
    if (!CRON_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'CRON_SECRET não configurado' }, { status: 500 })
    }
    if (CRON_SECRET && secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const supabase = getServiceClient()
    const agora = new Date()
    let emailsEnviados = 0

    // 10.3 - Empresas com trial expirando (1, 2 ou 3 dias)
    for (const dias of [3, 2, 1]) {
      const dataLimite = new Date(agora)
      dataLimite.setDate(dataLimite.getDate() + dias)
      const inicioJanela = new Date(dataLimite)
      inicioJanela.setHours(0, 0, 0, 0)
      const fimJanela = new Date(dataLimite)
      fimJanela.setHours(23, 59, 59, 999)

      const { data: empresas } = await supabase
        .from('empresas')
        .select('id, nome, nome_fantasia, email')
        .eq('status_assinatura', 'trial')
        .gte('trial_fim', inicioJanela.toISOString())
        .lte('trial_fim', fimJanela.toISOString())

      if (empresas) {
        for (const empresa of empresas) {
          if (empresa.email) {
            await emailService.trialExpirando(
              empresa.email,
              empresa.nome_fantasia || empresa.nome,
              dias
            )
            emailsEnviados++
          }
        }
      }
    }

    // 10.4 - Empresas com trial expirado (trial_fim < agora, status ainda trial)
    const { data: expiradas } = await supabase
      .from('empresas')
      .select('id, nome, nome_fantasia, email')
      .eq('status_assinatura', 'trial')
      .lt('trial_fim', agora.toISOString())

    if (expiradas) {
      for (const empresa of expiradas) {
        if (empresa.email) {
          await emailService.trialExpirou(
            empresa.email,
            empresa.nome_fantasia || empresa.nome
          )
          emailsEnviados++
        }

        // Atualizar status para expired
        await supabase
          .from('empresas')
          .update({ status_assinatura: 'expired' })
          .eq('id', empresa.id)
      }
    }

    return NextResponse.json({
      success: true,
      emails_enviados: emailsEnviados,
      trials_expirados: expiradas?.length || 0,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
