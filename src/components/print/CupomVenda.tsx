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

const larguraClasses: Record<string, string> = {
  '58': 'w-[58mm]',
  '80': 'w-[80mm]',
  'A4': 'w-full max-w-[210mm]',
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
