'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Empresa } from '@/types/database'

interface PrintConfig {
  largura: '58' | '80' | 'A4'
  mostrarLogo?: boolean
  mostrarEndereco?: boolean
  mostrarTelefone?: boolean
  mensagemCupom?: string
}

interface CupomVendaProps {
  venda: {
    numero: number
    cliente?: {
      nome: string
      telefone?: string
    } | null
    itens: {
      produto_id: string
      descricao: string
      quantidade: number
      valor_unitario: number
      valor_total: number
    }[]
    valor_total: number
    forma_pagamento: string
    data: string
  }
  empresa?: Empresa | null
  config?: PrintConfig
  operador?: string
}

const formasPagamentoLabel: Record<string, string> = {
  dinheiro: 'DINHEIRO',
  pix: 'PIX',
  débito: 'CARTÃO DÉBITO',
  crédito: 'CARTÃO CRÉDITO',
  debito: 'CARTÃO DÉBITO',
  credito: 'CARTÃO CRÉDITO',
}

export function CupomVenda({ venda, empresa, config, operador }: CupomVendaProps) {
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
  const isA4 = largura === 'A4'

  if (isA4) {
    return (
      <div className="w-full max-w-[210mm] mx-auto bg-white text-black font-sans text-sm p-8 print:p-6">
        {/* Header profissional */}
        <div className="flex items-start justify-between pb-4 border-b-2 border-gray-800 mb-6">
          <div className="flex items-center gap-4">
            {mostrarLogo && empresa?.logo_url && (
              <img
                src={empresa.logo_url}
                alt={nomeEmpresa}
                className="h-16 w-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{nomeEmpresa}</h1>
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
            <div className="bg-gray-900 text-white px-4 py-2 rounded">
              <p className="text-[10px] uppercase tracking-wider">Venda</p>
              <p className="text-2xl font-bold">#{venda.numero}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {format(new Date(venda.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
            {operador && (
              <p className="text-xs text-gray-500">Operador: {operador}</p>
            )}
          </div>
        </div>

        {/* Info grid: cliente + pagamento */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Cliente</p>
            {venda.cliente ? (
              <>
                <p className="font-semibold text-gray-900">{venda.cliente.nome}</p>
                {venda.cliente.telefone && (
                  <p className="text-xs text-gray-600">{venda.cliente.telefone}</p>
                )}
              </>
            ) : (
              <p className="text-gray-400">Consumidor final</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Forma de Pagamento</p>
            <p className="font-semibold text-gray-900">
              {formasPagamentoLabel[venda.forma_pagamento] || venda.forma_pagamento.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Tabela de itens */}
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-gray-900 text-white text-xs">
              <th className="text-left py-2 px-3 rounded-tl">#</th>
              <th className="text-left py-2 px-3">Descrição</th>
              <th className="text-center py-2 px-3">Qtd</th>
              <th className="text-right py-2 px-3">Unitário</th>
              <th className="text-right py-2 px-3 rounded-tr">Total</th>
            </tr>
          </thead>
          <tbody>
            {venda.itens.map((item, index) => (
              <tr
                key={item.produto_id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="py-2 px-3 text-xs text-gray-500">{index + 1}</td>
                <td className="py-2 px-3 font-medium">{item.descricao}</td>
                <td className="py-2 px-3 text-center">{item.quantidade}</td>
                <td className="py-2 px-3 text-right text-gray-600">{formatCurrency(item.valor_unitario)}</td>
                <td className="py-2 px-3 text-right font-semibold">{formatCurrency(item.valor_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totais */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-1 text-sm text-gray-600">
              <span>Itens ({venda.itens.reduce((acc, i) => acc + i.quantidade, 0)})</span>
              <span>{formatCurrency(venda.itens.reduce((acc, i) => acc + i.valor_total, 0))}</span>
            </div>
            <div className="flex justify-between py-3 mt-2 border-t-2 border-gray-900 text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(venda.valor_total)}</span>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="border-t border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Cupom Não Fiscal</p>
          <p className="text-sm text-gray-600">{mensagemCupom}</p>
        </div>
      </div>
    )
  }

  // ===== Layout térmico (58mm / 80mm) =====
  const larguraClasses: Record<string, string> = {
    '58': 'w-[58mm]',
    '80': 'w-[80mm]',
  }

  return (
    <div className={`${larguraClasses[largura]} mx-auto p-4 bg-white text-black font-mono text-xs`}>
      {/* Cabeçalho */}
      <div className="text-center border-b border-dashed border-black pb-2 mb-2">
        {mostrarLogo && empresa?.logo_url && (
          <img
            src={empresa.logo_url}
            alt={nomeEmpresa}
            className="h-12 mx-auto mb-1 object-contain"
          />
        )}
        <h1 className="text-base font-bold">{nomeEmpresa}</h1>
        {empresa?.cnpj && <p className="text-[10px]">CNPJ: {empresa.cnpj}</p>}

        {mostrarEndereco && empresa?.endereco && (
          <p className="text-[10px]">
            {empresa.endereco}
            {empresa.numero ? `, ${empresa.numero}` : ''}
            {empresa.bairro ? ` - ${empresa.bairro}` : ''}
          </p>
        )}
        {mostrarEndereco && empresa?.cidade && (
          <p className="text-[10px]">
            {empresa.cidade}{empresa.estado ? `/${empresa.estado}` : ''}
            {empresa.cep ? ` - CEP: ${empresa.cep}` : ''}
          </p>
        )}

        {mostrarTelefone && (
          <>
            {empresa?.telefone && <p className="text-[10px]">Tel: {empresa.telefone}</p>}
            {empresa?.whatsapp && empresa.whatsapp !== empresa.telefone && (
              <p className="text-[10px]">WhatsApp: {empresa.whatsapp}</p>
            )}
          </>
        )}
      </div>

      {/* Título */}
      <div className="text-center mb-2">
        <h2 className="font-bold">CUPOM NÃO FISCAL</h2>
        <p className="text-lg font-bold">VENDA #{venda.numero}</p>
      </div>

      {/* Data e Operador */}
      <div className="text-center text-[10px] mb-2">
        <p>{format(new Date(venda.data), "dd/MM/yyyy 'as' HH:mm:ss", { locale: ptBR })}</p>
        {operador && <p>Operador: {operador}</p>}
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Cliente */}
      {venda.cliente && (
        <>
          <div className="mb-2">
            <p className="font-bold">CLIENTE:</p>
            <p>{venda.cliente.nome}</p>
            {venda.cliente.telefone && <p>Tel: {venda.cliente.telefone}</p>}
          </div>
          <div className="border-t border-dashed border-black my-2" />
        </>
      )}

      {/* Itens */}
      <div className="mb-2">
        <p className="font-bold mb-1">ITENS:</p>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-1">ITEM</th>
              <th className="text-center">QTD</th>
              <th className="text-right">VALOR</th>
            </tr>
          </thead>
          <tbody>
            {venda.itens.map((item, index) => (
              <tr key={item.produto_id} className="border-b border-dotted border-gray-400">
                <td className="py-1 pr-1">
                  <span className="text-[9px]">{index + 1}.</span> {item.descricao}
                </td>
                <td className="text-center">{item.quantidade}</td>
                <td className="text-right">{formatCurrency(item.valor_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Totais */}
      <div className="mb-2">
        <div className="flex justify-between">
          <span>Qtd. Itens:</span>
          <span>{venda.itens.reduce((acc, i) => acc + i.quantidade, 0)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-black mt-1 pt-1">
          <span>TOTAL:</span>
          <span>{formatCurrency(venda.valor_total)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Forma de Pagamento */}
      <div className="text-center mb-2">
        <p className="font-bold">FORMA DE PAGAMENTO</p>
        <p className="text-sm">{formasPagamentoLabel[venda.forma_pagamento] || venda.forma_pagamento.toUpperCase()}</p>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Rodapé */}
      <div className="text-center text-[9px]">
        <p className="font-bold mb-1">DOCUMENTO SEM VALOR FISCAL</p>
        <p>{mensagemCupom}</p>
      </div>

      {/* Código */}
      <div className="text-center mt-4 text-[8px] text-gray-500">
        <p>*** {format(new Date(), 'yyyyMMddHHmmss')}-{venda.numero} ***</p>
      </div>
    </div>
  )
}
