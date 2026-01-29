'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Empresa } from '@/types/database'

interface PrintConfig {
  largura: '58' | '80' | 'A4'
  mostrarLogo?: boolean
  mostrarEndereco?: boolean
  mostrarTelefone?: boolean
}

interface CupomOSProps {
  os: {
    número: number
    status: string
    tipo_aparelho?: string
    marca?: string
    modelo?: string
    cor?: string
    imei?: string
    senha_aparelho?: string
    senha_aparelho_masked?: string
    condicao_entrada?: string
    acessórios?: string
    problema_relatado: string
    valor_serviços: number
    valor_produtos: number
    valor_desconto: number
    valor_total: number
    data_entrada: string
    data_previsao?: string
    cliente?: {
      nome: string
      telefone?: string
      cpf?: string
    }
    itens?: {
      id: string
      tipo: string
      nome: string
      quantidade: number
      valor_unitario: number
    }[]
  }
  tipo?: 'entrada' | 'completa' | 'entrega'
  empresa?: Empresa | null
  config?: PrintConfig
  operador?: string
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

  const larguraClasses: Record<string, string> = {
    '58': 'w-[58mm]',
    '80': 'w-[80mm]',
    'A4': 'w-full max-w-[210mm]',
  }

  const nomeEmpresa = empresa?.nome_fantasia || empresa?.nome || 'LOJA DE CELULAR'

  const getTitulo = () => {
    switch (tipo) {
      case 'entrada': return 'COMPROVANTE DE ENTRADA'
      case 'entrega': return 'COMPROVANTE DE ENTREGA'
      default: return 'ORDEM DE SERVIÇO'
    }
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
        <h2 className="font-bold text-sm">{getTitulo()}</h2>
        <p className="text-lg font-bold">OS #{os.número}</p>
      </div>

      {/* Data e Operador */}
      <div className="text-center text-[10px] mb-2">
        <p>Data: {format(new Date(os.data_entrada), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}</p>
        {os.data_previsao && (
          <p>Previsao: {format(new Date(os.data_previsao), 'dd/MM/yyyy', { locale: ptBR })}</p>
        )}
        {operador && <p>Operador: {operador}</p>}
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Cliente */}
      <div className="mb-2">
        <p className="font-bold">CLIENTE:</p>
        <p>{os.cliente?.nome}</p>
        {os.cliente?.telefone && <p>Tel: {os.cliente.telefone}</p>}
        {os.cliente?.cpf && <p>CPF: {os.cliente.cpf}</p>}
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Aparelho */}
      <div className="mb-2">
        <p className="font-bold">APARELHO:</p>
        <p>{os.marca} {os.modelo}</p>
        {os.cor && <p>Cor: {os.cor}</p>}
        {os.imei && <p>IMEI: {os.imei}</p>}
      </div>

      {/* Senha - para entrada mostra visível, para entrega mostra mascarada */}
      {tipo === 'entrada' && os.senha_aparelho && (
        <div className="border border-black p-2 my-2 bg-gray-100">
          <p className="font-bold text-center">SENHA DO APARELHO</p>
          <p className="text-center text-base font-bold">{os.senha_aparelho}</p>
          <p className="text-center text-[10px]">(Guarde este comprovante)</p>
        </div>
      )}

      {tipo === 'entrega' && os.senha_aparelho_masked && (
        <div className="border border-black p-2 my-2 bg-gray-100">
          <p className="font-bold text-center">SENHA DO APARELHO</p>
          <p className="text-center text-base font-bold">{os.senha_aparelho_masked}</p>
        </div>
      )}

      {/* Condição de Entrada (entrada e completa) */}
      {tipo !== 'entrega' && os.condicao_entrada && (
        <div className="mb-2">
          <p className="font-bold">CONDICAO:</p>
          <p className="text-[10px]">{os.condicao_entrada}</p>
        </div>
      )}

      {/* Acessórios */}
      {tipo !== 'entrega' && os.acessórios && (
        <div className="mb-2">
          <p className="font-bold">ACESSORIOS:</p>
          <p className="text-[10px]">{os.acessórios}</p>
        </div>
      )}

      <div className="border-t border-dashed border-black my-2" />

      {/* Problema (entrada e completa) */}
      {tipo !== 'entrega' && (
        <div className="mb-2">
          <p className="font-bold">PROBLEMA RELATADO:</p>
          <p className="text-[10px]">{os.problema_relatado}</p>
        </div>
      )}

      {/* Serviços realizados (entrega) */}
      {tipo === 'entrega' && os.itens && os.itens.length > 0 && (
        <div className="mb-2">
          <p className="font-bold">SERVIÇOS REALIZADOS:</p>
          {os.itens.map(item => (
            <div key={item.id} className="flex justify-between text-[10px]">
              <span>{item.quantidade}x {item.nome}</span>
              <span>{formatCurrency(item.valor_unitario * item.quantidade)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Itens (completa) */}
      {tipo === 'completa' && os.itens && os.itens.length > 0 && (
        <>
          <div className="border-t border-dashed border-black my-2" />
          <div className="mb-2">
            <p className="font-bold">SERVIÇOS/PEÇAS:</p>
            {os.itens.map(item => (
              <div key={item.id} className="flex justify-between text-[10px]">
                <span>{item.quantidade}x {item.nome}</span>
                <span>{formatCurrency(item.valor_unitario * item.quantidade)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-black my-2" />

          {/* Totais */}
          <div className="mb-2">
            <div className="flex justify-between">
              <span>Serviços:</span>
              <span>{formatCurrency(os.valor_serviços)}</span>
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
            <div className="flex justify-between font-bold text-sm border-t border-black mt-1 pt-1">
              <span>TOTAL:</span>
              <span>{formatCurrency(os.valor_total)}</span>
            </div>
          </div>
        </>
      )}

      {/* Total (entrega) */}
      {tipo === 'entrega' && (
        <>
          <div className="border-t border-dashed border-black my-2" />
          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL:</span>
            <span>{formatCurrency(os.valor_total)}</span>
          </div>
        </>
      )}

      <div className="border-t border-dashed border-black my-2" />

      {/* Termos */}
      {tipo === 'entrada' && (
        <div className="text-[8px] text-center mb-2">
          <p className="font-bold mb-1">TERMOS DE RESPONSABILIDADE</p>
          <p>1. O prazo para retirada do aparelho é de 90 (noventa) dias corridos a partir da data de entrada.</p>
          <p>2. Após este prazo, a empresa não se responsabiliza pelo aparelho.</p>
          <p>3. A garantia do serviço é de 90 (noventa) dias, exceto danos causados por mau uso, quedas ou contato com líquidos.</p>
          <p>4. O cliente autoriza a abertura e manuseio do aparelho para fins de diagnóstico e reparo.</p>
          <p>5. Peças substituídas não serão devolvidas, salvo solicitação prévia.</p>
        </div>
      )}

      {tipo === 'entrega' && (
        <div className="text-[8px] text-center mb-2">
          <p>Declaro que recebi o aparelho acima descrito</p>
          <p>em perfeitas condições de funcionamento.</p>
          <p className="mt-1">Garantia do serviço: 90 dias</p>
          <p>(exceto danos por mau uso)</p>
        </div>
      )}

      {tipo === 'completa' && (
        <div className="text-[8px] text-center mb-2">
          <p>Prazo para retirada: 90 dias</p>
          <p>Após este prazo, a empresa não se</p>
          <p>responsabiliza pelo aparelho.</p>
          <p className="mt-1">Garantia do serviço: 90 dias</p>
          <p>(exceto danos por mau uso)</p>
        </div>
      )}

      <div className="border-t border-dashed border-black my-2" />

      {/* Assinatura */}
      <div className="mt-4">
        <div className="border-t border-black mt-8 pt-1 text-center">
          <p className="text-[10px]">Assinatura do Cliente</p>
        </div>
      </div>

      {/* Rodapé */}
      <div className="text-center mt-4 text-[8px]">
        <p>Obrigado pela preferência!</p>
        <p>{format(new Date(), "dd/MM/yyyy HH:mm")}</p>
      </div>
    </div>
  )
}
