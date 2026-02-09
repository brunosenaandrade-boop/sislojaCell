import { Resend } from 'resend'

let _resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'CellFlow <contato@cellflow.com.br>'
const REPLY_TO_EMAIL = process.env.RESEND_REPLY_TO || 'suporte@cellflow.com.br'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cellflow.com.br'


export interface EmailResult {
  success: boolean
  error?: string
}

/**
 * Converte caracteres acentuados/especiais para HTML entities.
 * Garante que o corpo do email renderize corretamente em qualquer client.
 */
function encodeHtmlEntities(str: string): string {
  return str
    .replace(/[\u00C0-\u024F\u1E00-\u1EFF]/g, (char) => `&#${char.charCodeAt(0)};`)
    .replace(/[\u2000-\u206F\u2190-\u27BF\u{1F000}-\u{1FFFF}]/gu, (char) => {
      const cp = char.codePointAt(0)
      return cp ? `&#${cp};` : ''
    })
    .replace(/\u2014/g, '&#8212;') // em dash
    .replace(/\u2013/g, '&#8211;') // en dash
}

/**
 * Codifica o subject em MIME RFC 2047 (base64 UTF-8)
 * para garantir que caracteres acentuados cheguem corretos.
 */
function encodeMimeSubject(subject: string): string {
  const hasNonAscii = /[^\x00-\x7F]/.test(subject)
  if (!hasNonAscii) return subject
  const encoded = Buffer.from(subject, 'utf-8').toString('base64')
  return `=?UTF-8?B?${encoded}?=`
}

/**
 * Gera versão plain-text do HTML (fallback para email clients).
 */
function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&copy;/g, '(c)')
    .replace(/&#\d+;/g, (entity) => {
      const code = parseInt(entity.replace('&#', '').replace(';', ''))
      return String.fromCodePoint(code)
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
  const resend = getResend()
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY n\u00e3o configurada, email n\u00e3o enviado:', subject)
    return { success: true } // fail-open em dev
  }

  try {
    const safeHtml = encodeHtmlEntities(html)
    const safeSubject = encodeMimeSubject(subject)
    const textVersion = htmlToText(html)

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: safeSubject,
      html: safeHtml,
      text: textVersion,
      replyTo: REPLY_TO_EMAIL,
      headers: {
        'X-Mailer': 'CellFlow',
      },
    })

    if (error) {
      console.error('[Email] Erro ao enviar:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[Email] Erro:', msg)
    return { success: false, error: msg }
  }
}

// ============================================
// LAYOUT BASE
// ============================================

function emailLayout(content: string) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <!-- Header -->
    <div style="text-align:center;padding:20px 0;">
      <div style="display:inline-block;background-color:#2563eb;color:#fff;font-weight:bold;font-size:14px;padding:8px 12px;border-radius:8px;">CF</div>
      <span style="margin-left:8px;font-size:18px;font-weight:600;color:#111;">CellFlow</span>
    </div>
    <!-- Content -->
    <div style="background-color:#fff;border-radius:12px;padding:32px;border:1px solid #e4e4e7;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;padding:20px 0;color:#71717a;font-size:12px;">
      <p>&copy; ${new Date().getFullYear()} CellFlow. Todos os direitos reservados.</p>
      <p><a href="${APP_URL}" style="color:#2563eb;text-decoration:none;">${APP_URL}</a></p>
    </div>
  </div>
</body>
</html>`
}

function ctaButton(text: string, url: string) {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;background-color:#2563eb;color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">${text}</a>
  </div>`
}

// ============================================
// TEMPLATES
// ============================================

export const emailService = {
  // 10.2 - Boas-vindas
  async boasVindas(to: string, nomeEmpresa: string): Promise<EmailResult> {
    const html = emailLayout(`
      <h1 style="font-size:24px;color:#111;margin:0 0 16px;">Bem-vindo ao CellFlow!</h1>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Olá! A empresa <strong>${nomeEmpresa}</strong> foi cadastrada com sucesso.
      </p>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Você tem <strong>7 dias grátis</strong> para testar todas as funcionalidades do sistema:
        PDV, ordens de serviço, estoque, caixa, relatórios e muito mais.
      </p>
      ${ctaButton('Acessar o Sistema', `${APP_URL}/dashboard`)}
      <p style="color:#71717a;font-size:12px;">
        Se precisar de ajuda, acesse o sistema e clique no botão de ajuda.
      </p>
    `)
    return sendEmail(to, `Bem-vindo ao CellFlow, ${nomeEmpresa}!`, html)
  },

  // 10.3 - Trial expirando
  async trialExpirando(to: string, nomeEmpresa: string, diasRestantes: number): Promise<EmailResult> {
    const html = emailLayout(`
      <h1 style="font-size:24px;color:#111;margin:0 0 16px;">Seu trial expira em ${diasRestantes} dia(s)</h1>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Olá, <strong>${nomeEmpresa}</strong>!
      </p>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Seu período de teste gratuito expira em <strong>${diasRestantes} dia(s)</strong>.
        Após esse período, o acesso ao sistema será limitado.
      </p>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Assine por apenas <strong>R$ 150/mês</strong> (12x no cartão ou R$ 1.800 à vista) e continue
        usando o sistema sem limites.
      </p>
      ${ctaButton('Assinar Agora', `${APP_URL}/planos`)}
      <p style="color:#71717a;font-size:12px;">
        Plano Anual: tudo ilimitado, suporte prioritário, backup dos dados.
      </p>
    `)
    return sendEmail(to, `[CellFlow] Seu trial expira em ${diasRestantes} dia(s)`, html)
  },

  // 10.4 - Trial expirou
  async trialExpirou(to: string, nomeEmpresa: string): Promise<EmailResult> {
    const html = emailLayout(`
      <h1 style="font-size:24px;color:#dc2626;margin:0 0 16px;">Seu período de teste expirou</h1>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Olá, <strong>${nomeEmpresa}</strong>!
      </p>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Seu trial de 7 dias chegou ao fim. O acesso ao sistema está limitado até que
        você assine o plano.
      </p>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Não perca seus dados! Assine agora e retome o controle da sua loja.
      </p>
      ${ctaButton('Assinar Agora - R$ 150/mês', `${APP_URL}/planos`)}
    `)
    return sendEmail(to, `[CellFlow] Seu trial expirou — assine agora`, html)
  },

  // 10.5 - Pagamento confirmado
  async pagamentoConfirmado(to: string, nomeEmpresa: string, valor: number, data: string): Promise<EmailResult> {
    const valorFmt = valor.toFixed(2).replace('.', ',')
    const html = emailLayout(`
      <h1 style="font-size:24px;color:#16a34a;margin:0 0 16px;">Pagamento confirmado!</h1>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Olá, <strong>${nomeEmpresa}</strong>!
      </p>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Recebemos seu pagamento com sucesso.
      </p>
      <div style="background-color:#f4f4f5;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;font-size:14px;"><strong>Valor:</strong> R$ ${valorFmt}</p>
        <p style="margin:4px 0;font-size:14px;"><strong>Data:</strong> ${data}</p>
        <p style="margin:4px 0;font-size:14px;"><strong>Plano:</strong> Plano Anual</p>
      </div>
      ${ctaButton('Acessar o Sistema', `${APP_URL}/dashboard`)}
    `)
    return sendEmail(to, `[CellFlow] Pagamento de R$ ${valorFmt} confirmado`, html)
  },

  // 10.6 - Pagamento vencido
  async pagamentoVencido(to: string, nomeEmpresa: string, valor: number, dataVencimento: string): Promise<EmailResult> {
    const valorFmt = valor.toFixed(2).replace('.', ',')
    const html = emailLayout(`
      <h1 style="font-size:24px;color:#dc2626;margin:0 0 16px;">Pagamento pendente</h1>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Olá, <strong>${nomeEmpresa}</strong>!
      </p>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Identificamos que a fatura de <strong>R$ ${valorFmt}</strong> com vencimento em
        <strong>${dataVencimento}</strong> ainda não foi paga.
      </p>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Regularize o pagamento para evitar a suspensão do acesso ao sistema.
      </p>
      ${ctaButton('Regularizar Pagamento', `${APP_URL}/planos`)}
    `)
    return sendEmail(to, `[CellFlow] Fatura de R$ ${valorFmt} vencida`, html)
  },

  // 10.7 - Assinatura cancelada
  async assinaturaCancelada(to: string, nomeEmpresa: string): Promise<EmailResult> {
    const html = emailLayout(`
      <h1 style="font-size:24px;color:#111;margin:0 0 16px;">Assinatura cancelada</h1>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Olá, <strong>${nomeEmpresa}</strong>!
      </p>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Sua assinatura do CellFlow foi cancelada. Seu acesso permanece ativo
        até o final do período já pago.
      </p>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Sentiremos sua falta! Se mudar de ideia, pode reativar a qualquer momento.
      </p>
      ${ctaButton('Reativar Assinatura', `${APP_URL}/planos`)}
      <p style="color:#71717a;font-size:12px;">
        Seus dados serão mantidos por 90 dias após o fim do acesso.
      </p>
    `)
    return sendEmail(to, `[CellFlow] Assinatura cancelada`, html)
  },

  // 10.8 - Indicação bem-sucedida
  async indicacaoSucesso(to: string, nomeEmpresa: string, nomeIndicado: string): Promise<EmailResult> {
    const html = emailLayout(`
      <h1 style="font-size:24px;color:#16a34a;margin:0 0 16px;">Voc&#234; ganhou 1 m&#234;s gr&#225;tis!</h1>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Olá, <strong>${nomeEmpresa}</strong>!
      </p>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        A loja <strong>${nomeIndicado}</strong>, indicada por você, completou 30 dias
        como assinante ativo. Como recompensa, você ganhou <strong>1 mês adicional
        de acesso gratuito</strong>!
      </p>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Continue indicando e acumule mais meses grátis. Não há limite de indicações!
      </p>
      ${ctaButton('Ver Meu Plano', `${APP_URL}/planos`)}
    `)
    return sendEmail(to, `[CellFlow] Parabéns! +1 mês grátis por indicação`, html)
  },

  // 10.9 - Aviso de renovação próxima
  async assinaturaRenovando(to: string, nomeEmpresa: string, valor: number, dataVencimento: string, diasRestantes: number): Promise<EmailResult> {
    const valorFmt = valor.toFixed(2).replace('.', ',')
    const html = emailLayout(`
      <h1 style="font-size:24px;color:#f59e0b;margin:0 0 16px;">Renovação em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}</h1>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Olá, <strong>${nomeEmpresa}</strong>!
      </p>
      <p style="color:#52525b;font-size:14px;line-height:1.6;">
        Sua fatura de <strong>R$ ${valorFmt}</strong> vence em <strong>${dataVencimento}</strong>.
        Certifique-se de que o pagamento esteja em dia para evitar interrupção no acesso.
      </p>
      ${ctaButton('Ver Meu Plano', `${APP_URL}/planos`)}
    `)
    return sendEmail(to, `[CellFlow] Sua fatura vence em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}`, html)
  },
}
