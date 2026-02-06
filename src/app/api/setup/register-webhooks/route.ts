import { NextResponse } from 'next/server'
import { verifySuperadmin } from '../../superadmin/route-utils'
import { asaasService } from '@/services/asaas.service'

// ============================================
// POST /api/setup/register-webhooks
// Registrar webhooks do Asaas (superadmin only)
// ============================================

const WEBHOOK_EVENTS = [
  'PAYMENT_CREATED',
  'PAYMENT_RECEIVED',
  'PAYMENT_CONFIRMED',
  'PAYMENT_OVERDUE',
  'PAYMENT_DELETED',
  'PAYMENT_REFUNDED',
  'PAYMENT_UPDATED',
]

export async function POST() {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN
    const notificationEmail = process.env.ASAAS_NOTIFICATION_EMAIL || 'webhook@cellflow.com.br'

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_APP_URL não configurada' },
        { status: 400 }
      )
    }

    if (!webhookToken) {
      return NextResponse.json(
        { error: 'ASAAS_WEBHOOK_TOKEN não configurado' },
        { status: 400 }
      )
    }

    const fullUrl = `${webhookUrl}/api/asaas/webhook`

    // Registrar webhook no Asaas
    const { data, error } = await asaasService.registrarWebhook({
      name: 'CellFlow Webhook',
      url: fullUrl,
      email: notificationEmail,
      apiVersion: 3,
      enabled: true,
      interrupted: false,
      authToken: webhookToken,
      sendType: 'SEQUENTIALLY',
      events: WEBHOOK_EVENTS,
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Webhooks registrados com sucesso',
      webhook: {
        id: data?.id,
        url: fullUrl,
        enabled: data?.enabled,
        events: WEBHOOK_EVENTS,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET /api/setup/register-webhooks - Listar webhooks configurados
export async function GET() {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const { data, error } = await asaasService.listarWebhooks()

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ webhooks: data?.data || [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
