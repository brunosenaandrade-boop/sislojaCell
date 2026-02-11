import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  Smartphone,
  Phone,
  Clock,
  CheckCircle2,
  Circle,
  ArrowLeft,
  MessageCircle,
} from 'lucide-react'

// Status config para exibição pública
const statusConfig: Record<string, { label: string; descricao: string }> = {
  aberta: { label: 'Recebido', descricao: 'Seu aparelho foi recebido pela loja.' },
  em_analise: { label: 'Em Análise', descricao: 'O técnico está analisando o aparelho.' },
  aguardando_peca: { label: 'Aguardando Peça', descricao: 'Uma peça foi solicitada e estamos aguardando a chegada.' },
  aguardando_aprovacao: { label: 'Aguardando Aprovação', descricao: 'O orçamento foi enviado, aguardando sua aprovação.' },
  em_andamento: { label: 'Em Andamento', descricao: 'O reparo está sendo realizado.' },
  finalizada: { label: 'Finalizado', descricao: 'O serviço foi concluído! Seu aparelho está pronto.' },
  entregue: { label: 'Entregue', descricao: 'O aparelho já foi retirado.' },
  cancelada: { label: 'Cancelada', descricao: 'Esta ordem de serviço foi cancelada.' },
}

// Ordem do fluxo para a timeline (cancelada fica fora)
const statusFlow = ['aberta', 'em_analise', 'aguardando_peca', 'em_andamento', 'finalizada', 'entregue']

interface OSData {
  numero: number
  status: string
  tipo_aparelho?: string
  marca?: string
  modelo?: string
  cor?: string
  problema_relatado: string
  valor_total: number
  data_entrada: string
  data_previsao?: string
  data_finalizacao?: string
  data_entrega?: string
  itens: { id: string; tipo: string; descricao: string; quantidade: number }[]
}

interface EmpresaData {
  nome: string
  logo_url?: string
  telefone?: string
  whatsapp?: string
  cor_primaria?: string
}

async function fetchOS(codigo: string): Promise<{ os: OSData; empresa: EmpresaData } | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const url = `${baseUrl}/api/acompanhamento/${codigo}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ codigo: string }> }
): Promise<Metadata> {
  const { codigo } = await params
  const data = await fetchOS(codigo)

  if (!data) {
    return { title: 'OS não encontrada - CellFlow' }
  }

  const status = statusConfig[data.os.status]?.label || data.os.status
  const aparelho = [data.os.marca, data.os.modelo].filter(Boolean).join(' ')

  return {
    title: `OS #${data.os.numero} - ${status} | ${data.empresa.nome}`,
    description: `Acompanhe o status do seu ${aparelho}. Status atual: ${status}.`,
  }
}

export default async function AcompanharPage({
  params,
}: {
  params: Promise<{ codigo: string }>
}) {
  const { codigo } = await params
  const data = await fetchOS(codigo)

  if (!data || !data.empresa) {
    notFound()
  }

  const { os, empresa } = data
  const corPrimaria = empresa.cor_primaria || '#3b82f6'
  const aparelho = [os.marca, os.modelo].filter(Boolean).join(' ') || 'Aparelho'
  const isCancelada = os.status === 'cancelada'
  const isAguardandoAprovacao = os.status === 'aguardando_aprovacao'

  // Determina o índice do status atual na timeline
  const currentStatusIndex = statusFlow.indexOf(os.status)

  // Para aguardando_aprovacao, mostra como se estivesse entre em_analise e em_andamento
  const displayIndex = isAguardandoAprovacao ? 1 : currentStatusIndex

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const whatsappNumber = (empresa.whatsapp || '').replace(/\D/g, '')
  const telefoneNumber = (empresa.telefone || '').replace(/\D/g, '')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header minimalista */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="CellFlow" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-sm font-semibold text-gray-700">CellFlow</span>
          </Link>
          <span className="text-xs text-gray-400">Acompanhamento de OS</span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-4">
        {/* Card da empresa */}
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            {empresa.logo_url ? (
              <img
                src={empresa.logo_url}
                alt={empresa.nome}
                className="h-12 w-12 rounded-lg object-contain border border-gray-100"
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg text-white text-lg font-bold"
                style={{ backgroundColor: corPrimaria }}
              >
                {empresa.nome.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-semibold text-gray-900">{empresa.nome}</h1>
              <p className="text-sm text-gray-500">OS #{String(os.numero).padStart(5, '0')}</p>
            </div>
          </div>
        </div>

        {/* Card do aparelho */}
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Aparelho</span>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-gray-900">{aparelho}</p>
            {os.cor && <p className="text-sm text-gray-500">Cor: {os.cor}</p>}
            <p className="text-sm text-gray-500">{os.problema_relatado}</p>
          </div>
        </div>

        {/* Status atual com destaque */}
        <div
          className="rounded-xl p-4 shadow-sm border text-white"
          style={{ backgroundColor: corPrimaria }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80 uppercase tracking-wider">Status Atual</p>
              <p className="text-xl font-bold mt-1">
                {isCancelada
                  ? 'Cancelada'
                  : isAguardandoAprovacao
                    ? 'Aguardando Aprovação'
                    : statusConfig[os.status]?.label || os.status}
              </p>
              <p className="text-sm opacity-90 mt-1">
                {statusConfig[os.status]?.descricao}
              </p>
            </div>
            {os.status === 'finalizada' && (
              <CheckCircle2 className="h-12 w-12 opacity-80" />
            )}
          </div>
        </div>

        {/* Timeline */}
        {!isCancelada && (
          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-4">Progresso</p>
            <div className="space-y-0">
              {statusFlow.map((status, index) => {
                const isCompleted = index <= displayIndex
                const isCurrent = index === displayIndex
                const isLast = index === statusFlow.length - 1
                const config = statusConfig[status]

                return (
                  <div key={status} className="flex gap-3">
                    {/* Indicador */}
                    <div className="flex flex-col items-center">
                      {isCompleted ? (
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: corPrimaria }}
                        >
                          {isCurrent ? (
                            <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-200">
                          <Circle className="h-3 w-3 text-gray-300" />
                        </div>
                      )}
                      {!isLast && (
                        <div
                          className="w-0.5 h-8"
                          style={{
                            backgroundColor: index < displayIndex ? corPrimaria : '#e5e7eb',
                          }}
                        />
                      )}
                    </div>
                    {/* Texto */}
                    <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
                      <p
                        className={`text-sm font-medium ${
                          isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {config.label}
                        {isCurrent && isAguardandoAprovacao && status === 'em_analise' && (
                          <span className="ml-2 text-xs font-normal text-purple-600">
                            (Aguardando sua aprovação)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Datas */}
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Datas</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Entrada</span>
              <span className="font-medium text-gray-900">{formatDate(os.data_entrada)}</span>
            </div>
            {os.data_previsao && (
              <div className="flex justify-between">
                <span className="text-gray-500">Previsão</span>
                <span className="font-medium text-gray-900">{formatDate(os.data_previsao)}</span>
              </div>
            )}
            {os.data_finalizacao && (
              <div className="flex justify-between">
                <span className="text-gray-500">Finalizado</span>
                <span className="font-medium text-green-700">{formatDate(os.data_finalizacao)}</span>
              </div>
            )}
            {os.data_entrega && (
              <div className="flex justify-between">
                <span className="text-gray-500">Entregue</span>
                <span className="font-medium text-gray-900">{formatDate(os.data_entrega)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Serviços realizados (só mostra se finalizada/entregue) */}
        {os.itens.length > 0 && ['finalizada', 'entregue'].includes(os.status) && (
          <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">Serviços Realizados</p>
            <div className="space-y-2">
              {os.itens.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantidade > 1 ? `${item.quantidade}x ` : ''}
                    {item.descricao}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: item.tipo === 'servico' ? '#dbeafe' : '#dcfce7',
                      color: item.tipo === 'servico' ? '#1d4ed8' : '#15803d',
                    }}
                  >
                    {item.tipo === 'servico' ? 'Serviço' : 'Peça'}
                  </span>
                </div>
              ))}
            </div>
            {os.valor_total > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="text-sm font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.valor_total)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Contato via WhatsApp */}
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              `Olá! Gostaria de saber sobre minha OS #${String(os.numero).padStart(5, '0')}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            Falar com a loja via WhatsApp
          </a>
        )}

        {!whatsappNumber && telefoneNumber && (
          <a
            href={`tel:${telefoneNumber}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Phone className="h-5 w-5" />
            Ligar para a loja
          </a>
        )}

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <Link href="/" className="text-blue-500 hover:underline">
              CellFlow
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
