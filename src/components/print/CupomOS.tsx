'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { QRCodeSVG } from 'qrcode.react'
import type { Empresa } from '@/types/database'

interface PrintConfig {
  largura: '58' | '80' | 'A4'
  mostrarLogo?: boolean
  mostrarEndereco?: boolean
  mostrarTelefone?: boolean
  mensagemCupom?: string
}

interface CupomOSProps {
  os: {
    numero: number
    status: string
    tipo_aparelho?: string
    marca?: string
    modelo?: string
    cor?: string
    imei?: string
    numero_serie?: string
    senha_aparelho?: string
    senha_aparelho_masked?: string
    tipo_desbloqueio?: 'sem_senha' | 'padrao' | 'pin' | 'senha'
    padrao_desbloqueio?: number[]
    pin_desbloqueio?: string
    condicao_entrada?: string
    acessorios?: string
    problema_relatado: string
    valor_servicos: number
    valor_produtos: number
    valor_desconto: number
    valor_total: number
    pago?: boolean
    forma_pagamento?: string
    data_entrada: string
    data_previsao?: string
    data_finalizacao?: string
    data_entrega?: string
    codigo_acompanhamento?: string
    cliente?: {
      nome: string
      telefone?: string
      cpf?: string
    }
    itens?: {
      id: string
      tipo: string
      descricao: string
      quantidade: number
      valor_unitario: number
    }[]
  }
  tipo?: 'entrada' | 'completa' | 'entrega'
  empresa?: Empresa | null
  config?: PrintConfig
  operador?: string
}

const formasPagamentoLabel: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  debito: 'Cartão Débito',
  credito: 'Cartão Crédito',
  'débito': 'Cartão Débito',
  'crédito': 'Cartão Crédito',
}

export function CupomOS({ os, tipo = 'entrada', empresa, config, operador }: CupomOSProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const largura = config?.largura || '80'
  const mostrarLogo = config?.mostrarLogo !== false
  const mostrarEndereco = config?.mostrarEndereco !== false
  const mostrarTelefone = config?.mostrarTelefone !== false
  const mensagemCupom = config?.mensagemCupom || 'Obrigado pela preferência!'
  const nomeEmpresa = empresa?.nome_fantasia || empresa?.nome || 'LOJA DE CELULAR'
  const corPrimaria = empresa?.cor_primaria || '#111827'
  const isA4 = largura === 'A4'
  const urlAcompanhamento = os.codigo_acompanhamento
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://cellflow.com.br'}/acompanhar/${os.codigo_acompanhamento}`
    : null

  const getTitulo = () => {
    switch (tipo) {
      case 'entrada': return 'Comprovante de Entrada'
      case 'entrega': return 'Comprovante de Entrega'
      default: return 'Ordem de Serviço'
    }
  }

  const getTituloTermico = () => {
    switch (tipo) {
      case 'entrada': return 'COMPROVANTE DE ENTRADA'
      case 'entrega': return 'COMPROVANTE DE ENTREGA'
      default: return 'ORDEM DE SERVIÇO'
    }
  }

  // ===== Layout A4 profissional =====
  if (isA4) {
    return (
      <div className="w-full max-w-[210mm] mx-auto bg-white text-black font-sans text-sm p-8 print:p-6">
        {/* Header com cor primária */}
        <div
          className="flex items-start justify-between pb-4 mb-6"
          style={{ borderBottom: `3px solid ${corPrimaria}` }}
        >
          <div className="flex items-center gap-4">
            {mostrarLogo && empresa?.logo_url && (
              <img
                src={empresa.logo_url}
                alt={nomeEmpresa}
                className="h-20 w-20 object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{nomeEmpresa}</h1>
              {empresa?.cnpj && (
                <p className="text-xs text-gray-500">CNPJ: {empresa.cnpj}</p>
              )}
              {mostrarEndereco && empresa?.endereco && (
                <p className="text-xs text-gray-500">
                  {empresa.endereco}
                  {empresa.numero ? `, ${empresa.numero}` : ''}
                  {empresa.bairro ? ` - ${empresa.bairro}` : ''}
                  {empresa.cidade ? ` | ${empresa.cidade}` : ''}
                  {empresa.estado ? `/${empresa.estado}` : ''}
                </p>
              )}
              {mostrarTelefone && (empresa?.telefone || empresa?.whatsapp) && (
                <p className="text-xs text-gray-500">
                  {empresa?.telefone && `Tel: ${empresa.telefone}`}
                  {empresa?.whatsapp && empresa.whatsapp !== empresa.telefone && ` | WhatsApp: ${empresa.whatsapp}`}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div
              className="cupom-os-badge text-white px-5 py-3 rounded-lg"
              style={{ backgroundColor: corPrimaria }}
            >
              <p className="text-[10px] uppercase tracking-wider opacity-80">Ordem de Serviço</p>
              <p className="text-3xl font-bold">#{os.numero}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {format(new Date(os.data_entrada), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
            {os.data_previsao && (
              <p className="text-xs text-gray-500">
                Previsão: {format(new Date(os.data_previsao), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            )}
            {operador && (
              <p className="text-xs text-gray-500">Operador: {operador}</p>
            )}
          </div>
        </div>

        {/* Título do documento */}
        <h2 className="text-center text-lg font-bold text-gray-700 uppercase tracking-wide mb-6">
          {getTitulo()}
        </h2>

        {/* Grid: Cliente + Aparelho */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">&#128100;</span>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Dados do Cliente</p>
            </div>
            <p className="font-semibold text-gray-900">{os.cliente?.nome}</p>
            {os.cliente?.telefone && (
              <p className="text-xs text-gray-600">Tel: {os.cliente.telefone}</p>
            )}
            {os.cliente?.cpf && (
              <p className="text-xs text-gray-600">CPF: {os.cliente.cpf}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">&#128241;</span>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Aparelho</p>
            </div>
            <p className="font-semibold text-gray-900">{os.marca} {os.modelo}</p>
            {os.cor && <p className="text-xs text-gray-600">Cor: {os.cor}</p>}
            {os.imei && <p className="text-xs text-gray-600">IMEI: {os.imei}</p>}
            {os.numero_serie && <p className="text-xs text-gray-600">N/S: {os.numero_serie}</p>}
          </div>
        </div>

        {/* Desbloqueio */}
        {tipo === 'entrada' && os.tipo_desbloqueio && os.tipo_desbloqueio !== 'sem_senha' && (
          <div className="border-2 border-orange-300 rounded-lg p-4 mb-6 bg-orange-50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-base">&#128274;</span>
              <p className="text-xs uppercase tracking-wider text-orange-700 font-semibold">Desbloqueio do Aparelho</p>
            </div>
            {os.tipo_desbloqueio === 'padrao' && os.padrao_desbloqueio && (
              <div className="text-center">
                <div className="font-mono text-base font-bold">
                  {[0, 1, 2].map(row => (
                    <div key={row}>
                      {[1, 2, 3].map(col => {
                        const point = row * 3 + col
                        const order = os.padrao_desbloqueio?.indexOf(point) ?? -1
                        return (
                          <span key={col} className="inline-block w-8 text-center">
                            {order >= 0 ? order + 1 : '·'}
                          </span>
                        )
                      })}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sequência: {os.padrao_desbloqueio.join(' → ')}
                </p>
              </div>
            )}
            {os.tipo_desbloqueio === 'pin' && os.pin_desbloqueio && (
              <p className="text-center text-lg font-bold">PIN: {os.pin_desbloqueio}</p>
            )}
            {os.tipo_desbloqueio === 'senha' && os.senha_aparelho && (
              <p className="text-center text-lg font-bold">{os.senha_aparelho}</p>
            )}
            <p className="text-center text-xs text-orange-600 mt-2 font-medium">(Guarde este comprovante)</p>
          </div>
        )}

        {/* Fallback senha antiga */}
        {tipo === 'entrada' && !os.tipo_desbloqueio && os.senha_aparelho && (
          <div className="border-2 border-orange-300 rounded-lg p-4 mb-6 bg-orange-50 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-base">&#128274;</span>
              <p className="text-xs uppercase tracking-wider text-orange-700 font-semibold">Senha do Aparelho</p>
            </div>
            <p className="text-lg font-bold">{os.senha_aparelho}</p>
            <p className="text-xs text-orange-600 mt-2 font-medium">(Guarde este comprovante)</p>
          </div>
        )}

        {tipo === 'entrega' && os.senha_aparelho_masked && (
          <div className="border-2 border-gray-300 rounded-lg p-4 mb-6 bg-gray-50 text-center">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Senha do Aparelho</p>
            <p className="text-lg font-bold">{os.senha_aparelho_masked}</p>
          </div>
        )}

        {/* Detalhes: condição, acessórios, problema */}
        {tipo !== 'entrega' && (os.condicao_entrada || os.acessorios || os.problema_relatado) && (
          <div className="mb-6 space-y-3">
            {os.condicao_entrada && (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Condição de Entrada</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded p-3 border border-gray-100">{os.condicao_entrada}</p>
              </div>
            )}
            {os.acessorios && (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Acessórios</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded p-3 border border-gray-100">{os.acessorios}</p>
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Problema Relatado</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded p-3 border border-gray-100">{os.problema_relatado}</p>
            </div>
          </div>
        )}

        {/* Serviços (entrega e completa) */}
        {(tipo === 'entrega' || tipo === 'completa') && os.itens && os.itens.length > 0 && (
          <div className="mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 text-white text-xs">
                  <th className="text-left py-2 px-3 rounded-tl">Tipo</th>
                  <th className="text-left py-2 px-3">Descrição</th>
                  <th className="text-center py-2 px-3">Qtd</th>
                  <th className="text-right py-2 px-3 rounded-tr">Valor</th>
                </tr>
              </thead>
              <tbody>
                {os.itens.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-3 text-xs">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                        item.tipo === 'servico' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.tipo === 'servico' ? 'Serviço' : 'Peça'}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium">{item.descricao}</td>
                    <td className="py-2 px-3 text-center">{item.quantidade}</td>
                    <td className="py-2 px-3 text-right font-semibold">{formatCurrency(item.valor_unitario * item.quantidade)}</td>
                  </tr>
                ))}
              </tbody>
              {tipo === 'completa' && (
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td colSpan={3} className="py-1 px-3 text-right text-xs text-gray-500">Serviços</td>
                    <td className="py-1 px-3 text-right text-sm">{formatCurrency(os.valor_servicos)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-1 px-3 text-right text-xs text-gray-500">Peças</td>
                    <td className="py-1 px-3 text-right text-sm">{formatCurrency(os.valor_produtos)}</td>
                  </tr>
                  {os.valor_desconto > 0 && (
                    <tr>
                      <td colSpan={3} className="py-1 px-3 text-right text-xs text-red-500">Desconto</td>
                      <td className="py-1 px-3 text-right text-sm text-red-600">-{formatCurrency(os.valor_desconto)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-900">
                    <td colSpan={3} className="py-2 px-3 text-right font-bold text-base">Total</td>
                    <td className="py-2 px-3 text-right font-bold text-base">{formatCurrency(os.valor_total)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* Totais (entrega - sem footer na tabela) */}
        {tipo === 'entrega' && (
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <div className="flex justify-between py-3 border-t-2 border-gray-900 text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(os.valor_total)}</span>
              </div>
              {os.pago && os.forma_pagamento && (
                <div className="flex justify-between py-1 text-sm text-gray-600">
                  <span>Pagamento</span>
                  <span className="font-medium">{formasPagamentoLabel[os.forma_pagamento] || os.forma_pagamento}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Datas extras (entrega) */}
        {tipo === 'entrega' && (os.data_finalizacao || os.data_entrega) && (
          <div className="mb-6 grid grid-cols-2 gap-4 text-xs text-gray-500">
            {os.data_finalizacao && (
              <p>Finalizado em: {format(new Date(os.data_finalizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            )}
            {os.data_entrega && (
              <p>Entregue em: {format(new Date(os.data_entrega), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            )}
          </div>
        )}

        {/* Termos */}
        {tipo === 'entrada' && (
          <div className="border border-gray-200 rounded-lg p-4 mb-6 text-xs text-gray-600 leading-relaxed">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Termos de Responsabilidade</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>O prazo para retirada do aparelho é de 90 (noventa) dias corridos a partir da data de entrada.</li>
              <li>Após este prazo, a empresa não se responsabiliza pelo aparelho.</li>
              <li>A garantia do serviço é de 90 (noventa) dias, exceto danos causados por mau uso, quedas ou contato com líquidos.</li>
              <li>O cliente autoriza a abertura e manuseio do aparelho para fins de diagnóstico e reparo.</li>
              <li>Peças substituídas não serão devolvidas, salvo solicitação prévia.</li>
            </ol>
          </div>
        )}

        {tipo === 'entrega' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-xs text-gray-600 text-center leading-relaxed border border-gray-100">
            <p>Declaro que recebi o aparelho acima descrito em perfeitas condições de funcionamento.</p>
            <p className="mt-1 font-medium">Garantia do serviço: 90 dias (exceto danos por mau uso)</p>
          </div>
        )}

        {tipo === 'completa' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-xs text-gray-600 text-center leading-relaxed border border-gray-100">
            <p>Prazo para retirada: 90 dias. Após este prazo, a empresa não se responsabiliza pelo aparelho.</p>
            <p className="mt-1 font-medium">Garantia do serviço: 90 dias (exceto danos por mau uso)</p>
          </div>
        )}

        {/* Assinaturas lado a lado */}
        <div className="mt-8 pt-4 grid grid-cols-2 gap-12">
          <div>
            <div className="border-t-2 border-gray-400 pt-2 text-center">
              <p className="text-xs text-gray-500">Assinatura do Cliente</p>
            </div>
          </div>
          <div>
            <div className="border-t-2 border-gray-400 pt-2 text-center">
              <p className="text-xs text-gray-500">Assinatura da Empresa</p>
            </div>
          </div>
        </div>

        {/* QR Code de acompanhamento */}
        {urlAcompanhamento && (
          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col items-center gap-2">
            <QRCodeSVG value={urlAcompanhamento} size={100} />
            <p className="text-xs text-gray-500 text-center">
              Escaneie para acompanhar sua OS
            </p>
          </div>
        )}

        {/* Rodapé */}
        <div className="border-t border-gray-200 mt-6 pt-4 text-center">
          <p className="text-sm text-gray-600 mb-1">{mensagemCupom}</p>
          <p className="text-xs text-gray-400">
            {format(new Date(), "dd/MM/yyyy HH:mm")}
          </p>
        </div>
      </div>
    )
  }

  // ===== Layout térmico (58mm / 80mm) =====
  const is58mm = largura === '58'
  const sep80 = '════════════════════════════════'
  const sep58 = '══════════════════════'
  const sepLine = is58mm ? sep58 : sep80
  const thinSep80 = '────────────────────────────────'
  const thinSep58 = '──────────────────────'
  const thinSepLine = is58mm ? thinSep58 : thinSep80

  const SectionLabel = ({ label }: { label: string }) => (
    <div className={`text-center ${is58mm ? 'my-1 text-[8px]' : 'my-2 text-[10px]'} font-bold`}>
      <span>{is58mm ? `── ${label} ──` : `──── ${label} ────`}</span>
    </div>
  )

  const Separator = ({ thick = false }: { thick?: boolean }) => (
    <div className={`text-center overflow-hidden ${is58mm ? 'my-1 text-[7px]' : 'my-2 text-[8px]'} leading-none`}>
      {thick ? sepLine : thinSepLine}
    </div>
  )

  return (
    <div className={`${is58mm ? 'w-[58mm] p-2 text-[10px]' : 'w-[80mm] p-3 text-xs'} mx-auto bg-white text-black font-mono`}>
      {/* Cabeçalho */}
      <div className="text-center pb-1 mb-1">
        {mostrarLogo && empresa?.logo_url && (
          <img
            src={empresa.logo_url}
            alt={nomeEmpresa}
            className={`${is58mm ? 'h-10' : 'h-14'} mx-auto mb-1 object-contain`}
          />
        )}
        <h1 className={`${is58mm ? 'text-sm' : 'text-base'} font-bold`}>{nomeEmpresa}</h1>
        {empresa?.cnpj && <p className={is58mm ? 'text-[8px]' : 'text-[10px]'}>CNPJ: {empresa.cnpj}</p>}

        {mostrarEndereco && empresa?.endereco && (
          <p className={is58mm ? 'text-[8px]' : 'text-[10px]'}>
            {empresa.endereco}
            {empresa.numero ? `, ${empresa.numero}` : ''}
            {is58mm ? '' : (empresa.bairro ? ` - ${empresa.bairro}` : '')}
          </p>
        )}
        {mostrarEndereco && empresa?.cidade && (
          <p className={is58mm ? 'text-[8px]' : 'text-[10px]'}>
            {empresa.cidade}{empresa.estado ? `/${empresa.estado}` : ''}
            {is58mm ? '' : (empresa.cep ? ` - CEP: ${empresa.cep}` : '')}
          </p>
        )}

        {mostrarTelefone && (
          <>
            {empresa?.telefone && <p className={is58mm ? 'text-[8px]' : 'text-[10px]'}>Tel: {empresa.telefone}</p>}
            {!is58mm && empresa?.whatsapp && empresa.whatsapp !== empresa.telefone && (
              <p className="text-[10px]">WhatsApp: {empresa.whatsapp}</p>
            )}
          </>
        )}
      </div>

      <Separator thick />

      {/* Título + OS com destaque */}
      <div className="text-center mb-1">
        <h2 className={`font-bold ${is58mm ? 'text-xs' : 'text-sm'}`}>{getTituloTermico()}</h2>
      </div>

      <div className={`text-center border border-black ${is58mm ? 'py-1 my-1' : 'py-2 my-1'}`}>
        <p className={`font-bold ${is58mm ? 'text-lg' : 'text-xl'}`}>OS #{os.numero}</p>
      </div>

      {/* Data e Operador */}
      <div className={`text-center ${is58mm ? 'text-[8px]' : 'text-[10px]'} mb-1`}>
        <p>Data: {format(new Date(os.data_entrada), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        {os.data_previsao && (
          <p>Previsão: {format(new Date(os.data_previsao), 'dd/MM/yyyy', { locale: ptBR })}</p>
        )}
        {operador && <p>Operador: {operador}</p>}
      </div>

      {/* Cliente */}
      <SectionLabel label="CLIENTE" />
      <div className={is58mm ? 'mb-1' : 'mb-2'}>
        <p className={is58mm ? 'text-[9px]' : ''}>{os.cliente?.nome}</p>
        {os.cliente?.telefone && <p className={is58mm ? 'text-[8px]' : ''}>Tel: {os.cliente.telefone}</p>}
        {os.cliente?.cpf && <p className={is58mm ? 'text-[8px]' : ''}>CPF: {os.cliente.cpf}</p>}
      </div>

      {/* Aparelho */}
      <SectionLabel label="APARELHO" />
      <div className={is58mm ? 'mb-1' : 'mb-2'}>
        <p className={is58mm ? 'text-[9px]' : ''}>{os.marca} {os.modelo}</p>
        {os.cor && <p className={is58mm ? 'text-[8px]' : ''}>Cor: {os.cor}</p>}
        {os.imei && <p className={is58mm ? 'text-[8px]' : ''}>IMEI: {os.imei}</p>}
        {os.numero_serie && <p className={is58mm ? 'text-[8px]' : ''}>N/S: {os.numero_serie}</p>}
      </div>

      {/* Desbloqueio */}
      {tipo === 'entrada' && os.tipo_desbloqueio && os.tipo_desbloqueio !== 'sem_senha' && (
        <div className={`border-2 border-black ${is58mm ? 'p-1 my-1' : 'p-2 my-2'}`}>
          <p className={`font-bold text-center ${is58mm ? 'text-[9px]' : ''}`}>*** DESBLOQUEIO ***</p>
          {os.tipo_desbloqueio === 'padrao' && os.padrao_desbloqueio && (
            <>
              <p className={`text-center ${is58mm ? 'text-[7px]' : 'text-[10px]'} mb-1`}>Padrão:</p>
              <div className={`text-center font-mono ${is58mm ? 'text-xs' : 'text-sm'} font-bold`}>
                {[0, 1, 2].map(row => (
                  <div key={row}>
                    {[1, 2, 3].map(col => {
                      const point = row * 3 + col
                      const order = os.padrao_desbloqueio?.indexOf(point) ?? -1
                      return (
                        <span key={col} className={`inline-block ${is58mm ? 'w-4' : 'w-6'} text-center`}>
                          {order >= 0 ? order + 1 : '·'}
                        </span>
                      )
                    })}
                  </div>
                ))}
              </div>
              <p className={`text-center ${is58mm ? 'text-[7px]' : 'text-[10px]'} mt-1`}>
                Seq: {os.padrao_desbloqueio.join('→')}
              </p>
            </>
          )}
          {os.tipo_desbloqueio === 'pin' && os.pin_desbloqueio && (
            <p className={`text-center ${is58mm ? 'text-sm' : 'text-base'} font-bold`}>PIN: {os.pin_desbloqueio}</p>
          )}
          {os.tipo_desbloqueio === 'senha' && os.senha_aparelho && (
            <p className={`text-center ${is58mm ? 'text-sm' : 'text-base'} font-bold`}>{os.senha_aparelho}</p>
          )}
          <p className={`text-center ${is58mm ? 'text-[7px]' : 'text-[10px]'} font-bold`}>(Guarde este comprovante)</p>
        </div>
      )}

      {tipo === 'entrada' && !os.tipo_desbloqueio && os.senha_aparelho && (
        <div className={`border-2 border-black ${is58mm ? 'p-1 my-1' : 'p-2 my-2'}`}>
          <p className={`font-bold text-center ${is58mm ? 'text-[9px]' : ''}`}>*** SENHA ***</p>
          <p className={`text-center ${is58mm ? 'text-sm' : 'text-base'} font-bold`}>{os.senha_aparelho}</p>
          <p className={`text-center ${is58mm ? 'text-[7px]' : 'text-[10px]'} font-bold`}>(Guarde este comprovante)</p>
        </div>
      )}

      {tipo === 'entrega' && os.senha_aparelho_masked && (
        <div className={`border border-black ${is58mm ? 'p-1 my-1' : 'p-2 my-2'}`}>
          <p className={`font-bold text-center ${is58mm ? 'text-[9px]' : ''}`}>SENHA</p>
          <p className={`text-center ${is58mm ? 'text-sm' : 'text-base'} font-bold`}>{os.senha_aparelho_masked}</p>
        </div>
      )}

      {/* Condição */}
      {tipo !== 'entrega' && os.condicao_entrada && (
        <>
          <Separator />
          <div className={is58mm ? 'mb-1' : 'mb-2'}>
            <p className={`font-bold ${is58mm ? 'text-[9px]' : ''}`}>CONDIÇÃO:</p>
            <p className={is58mm ? 'text-[8px]' : 'text-[10px]'}>{os.condicao_entrada}</p>
          </div>
        </>
      )}

      {/* Acessórios */}
      {tipo !== 'entrega' && os.acessorios && (
        <div className={is58mm ? 'mb-1' : 'mb-2'}>
          <p className={`font-bold ${is58mm ? 'text-[9px]' : ''}`}>ACESSÓRIOS:</p>
          <p className={is58mm ? 'text-[8px]' : 'text-[10px]'}>{os.acessorios}</p>
        </div>
      )}

      {/* Problema */}
      {tipo !== 'entrega' && (
        <>
          <SectionLabel label="PROBLEMA" />
          <div className={is58mm ? 'mb-1' : 'mb-2'}>
            <p className={is58mm ? 'text-[8px]' : 'text-[10px]'}>{os.problema_relatado}</p>
          </div>
        </>
      )}

      {/* Serviços (entrega) */}
      {tipo === 'entrega' && os.itens && os.itens.length > 0 && (
        <>
          <SectionLabel label="SERVIÇOS" />
          <div className={is58mm ? 'mb-1' : 'mb-2'}>
            {os.itens.map(item => (
              <div key={item.id} className={`flex justify-between ${is58mm ? 'text-[8px]' : 'text-[10px]'}`}>
                <span className="truncate mr-1">{item.quantidade}x {item.descricao}</span>
                <span className="whitespace-nowrap">{formatCurrency(item.valor_unitario * item.quantidade)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Itens (completa) */}
      {tipo === 'completa' && os.itens && os.itens.length > 0 && (
        <>
          <SectionLabel label="ITENS" />
          <div className={is58mm ? 'mb-1' : 'mb-2'}>
            {os.itens.map(item => (
              <div key={item.id} className={`flex justify-between ${is58mm ? 'text-[8px]' : 'text-[10px]'}`}>
                <span className="truncate mr-1">{item.quantidade}x {item.descricao}</span>
                <span className="whitespace-nowrap">{formatCurrency(item.valor_unitario * item.quantidade)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className={is58mm ? 'mb-1 text-[9px]' : 'mb-2'}>
            <div className="flex justify-between">
              <span>Serviços:</span>
              <span>{formatCurrency(os.valor_servicos)}</span>
            </div>
            <div className="flex justify-between">
              <span>Peças:</span>
              <span>{formatCurrency(os.valor_produtos)}</span>
            </div>
            {os.valor_desconto > 0 && (
              <div className="flex justify-between">
                <span>Desconto:</span>
                <span>-{formatCurrency(os.valor_desconto)}</span>
              </div>
            )}
            <div className={`flex justify-between font-bold ${is58mm ? 'text-[10px]' : 'text-sm'} border-t border-black mt-1 pt-1`}>
              <span>TOTAL:</span>
              <span>{formatCurrency(os.valor_total)}</span>
            </div>
            {os.pago && os.forma_pagamento && (
              <div className={`flex justify-between ${is58mm ? 'text-[8px]' : 'text-[10px]'} mt-1`}>
                <span>Pagamento:</span>
                <span>{formasPagamentoLabel[os.forma_pagamento] || os.forma_pagamento}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Total (entrega) */}
      {tipo === 'entrega' && (
        <>
          <Separator thick />
          <div className={`flex justify-between font-bold ${is58mm ? 'text-[10px]' : 'text-sm'}`}>
            <span>TOTAL:</span>
            <span>{formatCurrency(os.valor_total)}</span>
          </div>
          {os.pago && os.forma_pagamento && (
            <div className={`flex justify-between ${is58mm ? 'text-[8px]' : 'text-[10px]'} mt-1`}>
              <span>Pagamento:</span>
              <span>{formasPagamentoLabel[os.forma_pagamento] || os.forma_pagamento}</span>
            </div>
          )}
        </>
      )}

      {/* Datas extras (entrega) */}
      {tipo === 'entrega' && (os.data_finalizacao || os.data_entrega) && (
        <div className={`${is58mm ? 'text-[7px] mt-1' : 'text-[9px] mt-2'} text-center`}>
          {os.data_finalizacao && (
            <p>Finalizado: {format(new Date(os.data_finalizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
          )}
          {os.data_entrega && (
            <p>Entregue: {format(new Date(os.data_entrega), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
          )}
        </div>
      )}

      <Separator thick />

      {/* Termos */}
      {tipo === 'entrada' && (
        <div className={`${is58mm ? 'text-[6px]' : 'text-[8px]'} text-center mb-1`}>
          <p className="font-bold mb-1">TERMOS</p>
          {is58mm ? (
            <>
              <p>Prazo retirada: 90 dias</p>
              <p>Garantia: 90 dias</p>
              <p>(exceto mau uso)</p>
            </>
          ) : (
            <>
              <p>1. Prazo para retirada: 90 dias corridos.</p>
              <p>2. Após o prazo, a empresa não se</p>
              <p>   responsabiliza pelo aparelho.</p>
              <p>3. Garantia: 90 dias (exceto mau uso,</p>
              <p>   quedas ou contato com líquidos).</p>
              <p>4. Cliente autoriza abertura do aparelho</p>
              <p>   para diagnóstico e reparo.</p>
              <p>5. Peças substituídas não serão devolvidas,</p>
              <p>   salvo solicitação prévia.</p>
            </>
          )}
        </div>
      )}

      {tipo === 'entrega' && (
        <div className={`${is58mm ? 'text-[6px]' : 'text-[8px]'} text-center mb-1`}>
          {is58mm ? (
            <>
              <p>Recebi em perfeitas condições</p>
              <p>Garantia: 90 dias</p>
            </>
          ) : (
            <>
              <p>Declaro que recebi o aparelho acima</p>
              <p>descrito em perfeitas condições.</p>
              <p className="mt-1">Garantia do serviço: 90 dias</p>
              <p>(exceto danos por mau uso)</p>
            </>
          )}
        </div>
      )}

      {tipo === 'completa' && (
        <div className={`${is58mm ? 'text-[6px]' : 'text-[8px]'} text-center mb-1`}>
          {is58mm ? (
            <>
              <p>Prazo retirada: 90 dias</p>
              <p>Garantia: 90 dias</p>
            </>
          ) : (
            <>
              <p>Prazo para retirada: 90 dias.</p>
              <p>Após este prazo, a empresa não se</p>
              <p>responsabiliza pelo aparelho.</p>
              <p className="mt-1">Garantia do serviço: 90 dias</p>
              <p>(exceto danos por mau uso)</p>
            </>
          )}
        </div>
      )}

      <Separator />

      {/* Assinatura */}
      <div className={is58mm ? 'mt-2' : 'mt-4'}>
        <div className={`border-t border-black ${is58mm ? 'mt-4' : 'mt-8'} pt-1 text-center`}>
          <p className={is58mm ? 'text-[8px]' : 'text-[10px]'}>Assinatura do Cliente</p>
        </div>
      </div>

      {/* QR Code de acompanhamento */}
      {urlAcompanhamento && (
        <div className={`text-center ${is58mm ? 'my-2' : 'my-3'}`}>
          <Separator />
          <div className="flex justify-center py-2">
            <QRCodeSVG value={urlAcompanhamento} size={is58mm ? 80 : 100} />
          </div>
          <p className={is58mm ? 'text-[7px]' : 'text-[9px]'}>
            Acompanhe sua OS pelo QR Code
          </p>
        </div>
      )}

      {/* Rodapé */}
      <div className={`text-center ${is58mm ? 'mt-2 text-[7px]' : 'mt-4 text-[9px]'}`}>
        <Separator />
        <p className="font-bold">{mensagemCupom}</p>
        <p className={is58mm ? 'text-[6px]' : 'text-[8px]'}>{format(new Date(), "dd/MM/yyyy HH:mm")}</p>
        <p className={`${is58mm ? 'text-[6px] mt-1' : 'text-[7px] mt-2'}`}>{'- - - - - - - - - - - - - -'}</p>
      </div>
    </div>
  )
}
