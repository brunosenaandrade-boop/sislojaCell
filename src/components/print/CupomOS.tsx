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
    numero: number
    status: string
    tipo_aparelho?: string
    marca?: string
    modelo?: string
    cor?: string
    imei?: string
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
  const nomeEmpresa = empresa?.nome_fantasia || empresa?.nome || 'LOJA DE CELULAR'
  const isA4 = largura === 'A4'

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
        {/* Header */}
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
              <p className="text-[10px] uppercase tracking-wider">OS</p>
              <p className="text-2xl font-bold">#{os.numero}</p>
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
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Dados do Cliente</p>
            <p className="font-semibold text-gray-900">{os.cliente?.nome}</p>
            {os.cliente?.telefone && (
              <p className="text-xs text-gray-600">Tel: {os.cliente.telefone}</p>
            )}
            {os.cliente?.cpf && (
              <p className="text-xs text-gray-600">CPF: {os.cliente.cpf}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Aparelho</p>
            <p className="font-semibold text-gray-900">{os.marca} {os.modelo}</p>
            {os.cor && <p className="text-xs text-gray-600">Cor: {os.cor}</p>}
            {os.imei && <p className="text-xs text-gray-600">IMEI: {os.imei}</p>}
          </div>
        </div>

        {/* Desbloqueio */}
        {tipo === 'entrada' && os.tipo_desbloqueio && os.tipo_desbloqueio !== 'sem_senha' && (
          <div className="border-2 border-gray-300 rounded-lg p-4 mb-6 bg-gray-50">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 text-center">Desbloqueio do Aparelho</p>
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
            <p className="text-center text-xs text-gray-400 mt-1">(Guarde este comprovante)</p>
          </div>
        )}

        {/* Fallback senha antiga */}
        {tipo === 'entrada' && !os.tipo_desbloqueio && os.senha_aparelho && (
          <div className="border-2 border-gray-300 rounded-lg p-4 mb-6 bg-gray-50 text-center">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Senha do Aparelho</p>
            <p className="text-lg font-bold">{os.senha_aparelho}</p>
            <p className="text-xs text-gray-400 mt-1">(Guarde este comprovante)</p>
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
                <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">{os.condicao_entrada}</p>
              </div>
            )}
            {os.acessorios && (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Acessórios</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">{os.acessorios}</p>
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Problema Relatado</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">{os.problema_relatado}</p>
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
            </table>
          </div>
        )}

        {/* Totais (completa e entrega) */}
        {(tipo === 'completa' || tipo === 'entrega') && (
          <div className="flex justify-end mb-6">
            <div className="w-64">
              {tipo === 'completa' && (
                <>
                  <div className="flex justify-between py-1 text-sm text-gray-600">
                    <span>Serviços</span>
                    <span>{formatCurrency(os.valor_servicos)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-sm text-gray-600">
                    <span>Peças</span>
                    <span>{formatCurrency(os.valor_produtos)}</span>
                  </div>
                  {os.valor_desconto > 0 && (
                    <div className="flex justify-between py-1 text-sm text-red-600">
                      <span>Desconto</span>
                      <span>-{formatCurrency(os.valor_desconto)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between py-3 mt-2 border-t-2 border-gray-900 text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(os.valor_total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Termos */}
        {tipo === 'entrada' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-xs text-gray-600 leading-relaxed">
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
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-xs text-gray-600 text-center leading-relaxed">
            <p>Declaro que recebi o aparelho acima descrito em perfeitas condições de funcionamento.</p>
            <p className="mt-1 font-medium">Garantia do serviço: 90 dias (exceto danos por mau uso)</p>
          </div>
        )}

        {tipo === 'completa' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-xs text-gray-600 text-center leading-relaxed">
            <p>Prazo para retirada: 90 dias. Após este prazo, a empresa não se responsabiliza pelo aparelho.</p>
            <p className="mt-1 font-medium">Garantia do serviço: 90 dias (exceto danos por mau uso)</p>
          </div>
        )}

        {/* Assinatura */}
        <div className="mt-8 pt-4">
          <div className="w-72 mx-auto">
            <div className="border-t-2 border-gray-400 pt-2 text-center">
              <p className="text-xs text-gray-500">Assinatura do Cliente</p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="border-t border-gray-200 mt-6 pt-4 text-center">
          <p className="text-xs text-gray-400">
            {format(new Date(), "dd/MM/yyyy HH:mm")} | Obrigado pela preferência!
          </p>
        </div>
      </div>
    )
  }

  // ===== Layout térmico (58mm / 80mm) =====
  // 58mm: área imprimível real ~48mm, padding menor
  // 80mm: área imprimível real ~72mm, padding normal
  const is58mm = largura === '58'

  return (
    <div className={`${is58mm ? 'w-[58mm] p-2 text-[10px]' : 'w-[80mm] p-3 text-xs'} mx-auto bg-white text-black font-mono`}>
      {/* Cabeçalho */}
      <div className="text-center border-b border-dashed border-black pb-1 mb-1">
        {mostrarLogo && empresa?.logo_url && (
          <img
            src={empresa.logo_url}
            alt={nomeEmpresa}
            className={`${is58mm ? 'h-8' : 'h-12'} mx-auto mb-1 object-contain`}
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

      {/* Título */}
      <div className="text-center mb-1">
        <h2 className={`font-bold ${is58mm ? 'text-xs' : 'text-sm'}`}>{getTituloTermico()}</h2>
        <p className={`font-bold ${is58mm ? 'text-base' : 'text-lg'}`}>OS #{os.numero}</p>
      </div>

      {/* Data e Operador */}
      <div className={`text-center ${is58mm ? 'text-[8px]' : 'text-[10px]'} mb-1`}>
        <p>Data: {format(new Date(os.data_entrada), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}</p>
        {os.data_previsao && (
          <p>Previsão: {format(new Date(os.data_previsao), 'dd/MM/yyyy', { locale: ptBR })}</p>
        )}
        {operador && <p>Operador: {operador}</p>}
      </div>

      <div className={`border-t border-dashed border-black ${is58mm ? 'my-1' : 'my-2'}`} />

      {/* Cliente */}
      <div className={is58mm ? 'mb-1' : 'mb-2'}>
        <p className={`font-bold ${is58mm ? 'text-[9px]' : ''}`}>CLIENTE:</p>
        <p className={is58mm ? 'text-[9px]' : ''}>{os.cliente?.nome}</p>
        {os.cliente?.telefone && <p className={is58mm ? 'text-[8px]' : ''}>Tel: {os.cliente.telefone}</p>}
        {os.cliente?.cpf && <p className={is58mm ? 'text-[8px]' : ''}>CPF: {os.cliente.cpf}</p>}
      </div>

      <div className={`border-t border-dashed border-black ${is58mm ? 'my-1' : 'my-2'}`} />

      {/* Aparelho */}
      <div className={is58mm ? 'mb-1' : 'mb-2'}>
        <p className={`font-bold ${is58mm ? 'text-[9px]' : ''}`}>APARELHO:</p>
        <p className={is58mm ? 'text-[9px]' : ''}>{os.marca} {os.modelo}</p>
        {os.cor && <p className={is58mm ? 'text-[8px]' : ''}>Cor: {os.cor}</p>}
        {os.imei && <p className={is58mm ? 'text-[8px]' : ''}>IMEI: {os.imei}</p>}
      </div>

      {/* Desbloqueio */}
      {tipo === 'entrada' && os.tipo_desbloqueio && os.tipo_desbloqueio !== 'sem_senha' && (
        <div className={`border border-black ${is58mm ? 'p-1 my-1' : 'p-2 my-2'} bg-gray-100`}>
          <p className={`font-bold text-center ${is58mm ? 'text-[9px]' : ''}`}>DESBLOQUEIO</p>
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
          <p className={`text-center ${is58mm ? 'text-[7px]' : 'text-[10px]'}`}>(Guarde este comprovante)</p>
        </div>
      )}

      {tipo === 'entrada' && !os.tipo_desbloqueio && os.senha_aparelho && (
        <div className={`border border-black ${is58mm ? 'p-1 my-1' : 'p-2 my-2'} bg-gray-100`}>
          <p className={`font-bold text-center ${is58mm ? 'text-[9px]' : ''}`}>SENHA</p>
          <p className={`text-center ${is58mm ? 'text-sm' : 'text-base'} font-bold`}>{os.senha_aparelho}</p>
          <p className={`text-center ${is58mm ? 'text-[7px]' : 'text-[10px]'}`}>(Guarde este comprovante)</p>
        </div>
      )}

      {tipo === 'entrega' && os.senha_aparelho_masked && (
        <div className={`border border-black ${is58mm ? 'p-1 my-1' : 'p-2 my-2'} bg-gray-100`}>
          <p className={`font-bold text-center ${is58mm ? 'text-[9px]' : ''}`}>SENHA</p>
          <p className={`text-center ${is58mm ? 'text-sm' : 'text-base'} font-bold`}>{os.senha_aparelho_masked}</p>
        </div>
      )}

      {/* Condição */}
      {tipo !== 'entrega' && os.condicao_entrada && (
        <div className={is58mm ? 'mb-1' : 'mb-2'}>
          <p className={`font-bold ${is58mm ? 'text-[9px]' : ''}`}>CONDIÇÃO:</p>
          <p className={is58mm ? 'text-[8px]' : 'text-[10px]'}>{os.condicao_entrada}</p>
        </div>
      )}

      {/* Acessórios */}
      {tipo !== 'entrega' && os.acessorios && (
        <div className={is58mm ? 'mb-1' : 'mb-2'}>
          <p className={`font-bold ${is58mm ? 'text-[9px]' : ''}`}>ACESSÓRIOS:</p>
          <p className={is58mm ? 'text-[8px]' : 'text-[10px]'}>{os.acessorios}</p>
        </div>
      )}

      <div className={`border-t border-dashed border-black ${is58mm ? 'my-1' : 'my-2'}`} />

      {/* Problema */}
      {tipo !== 'entrega' && (
        <div className={is58mm ? 'mb-1' : 'mb-2'}>
          <p className={`font-bold ${is58mm ? 'text-[9px]' : ''}`}>PROBLEMA:</p>
          <p className={is58mm ? 'text-[8px]' : 'text-[10px]'}>{os.problema_relatado}</p>
        </div>
      )}

      {/* Serviços (entrega) */}
      {tipo === 'entrega' && os.itens && os.itens.length > 0 && (
        <div className={is58mm ? 'mb-1' : 'mb-2'}>
          <p className={`font-bold ${is58mm ? 'text-[9px]' : ''}`}>SERVIÇOS:</p>
          {os.itens.map(item => (
            <div key={item.id} className={`flex justify-between ${is58mm ? 'text-[8px]' : 'text-[10px]'}`}>
              <span className="truncate mr-1">{item.quantidade}x {item.descricao}</span>
              <span className="whitespace-nowrap">{formatCurrency(item.valor_unitario * item.quantidade)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Itens (completa) */}
      {tipo === 'completa' && os.itens && os.itens.length > 0 && (
        <>
          <div className={`border-t border-dashed border-black ${is58mm ? 'my-1' : 'my-2'}`} />
          <div className={is58mm ? 'mb-1' : 'mb-2'}>
            <p className={`font-bold ${is58mm ? 'text-[9px]' : ''}`}>ITENS:</p>
            {os.itens.map(item => (
              <div key={item.id} className={`flex justify-between ${is58mm ? 'text-[8px]' : 'text-[10px]'}`}>
                <span className="truncate mr-1">{item.quantidade}x {item.descricao}</span>
                <span className="whitespace-nowrap">{formatCurrency(item.valor_unitario * item.quantidade)}</span>
              </div>
            ))}
          </div>

          <div className={`border-t border-dashed border-black ${is58mm ? 'my-1' : 'my-2'}`} />

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
          </div>
        </>
      )}

      {/* Total (entrega) */}
      {tipo === 'entrega' && (
        <>
          <div className={`border-t border-dashed border-black ${is58mm ? 'my-1' : 'my-2'}`} />
          <div className={`flex justify-between font-bold ${is58mm ? 'text-[10px]' : 'text-sm'}`}>
            <span>TOTAL:</span>
            <span>{formatCurrency(os.valor_total)}</span>
          </div>
        </>
      )}

      <div className={`border-t border-dashed border-black ${is58mm ? 'my-1' : 'my-2'}`} />

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
              <p>1. O prazo para retirada do aparelho é de 90 (noventa) dias corridos a partir da data de entrada.</p>
              <p>2. Após este prazo, a empresa não se responsabiliza pelo aparelho.</p>
              <p>3. A garantia do serviço é de 90 (noventa) dias, exceto danos causados por mau uso, quedas ou contato com líquidos.</p>
              <p>4. O cliente autoriza a abertura e manuseio do aparelho para fins de diagnóstico e reparo.</p>
              <p>5. Peças substituídas não serão devolvidas, salvo solicitação prévia.</p>
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
              <p>Declaro que recebi o aparelho acima descrito</p>
              <p>em perfeitas condições de funcionamento.</p>
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
              <p>Prazo para retirada: 90 dias</p>
              <p>Após este prazo, a empresa não se</p>
              <p>responsabiliza pelo aparelho.</p>
              <p className="mt-1">Garantia do serviço: 90 dias</p>
              <p>(exceto danos por mau uso)</p>
            </>
          )}
        </div>
      )}

      <div className={`border-t border-dashed border-black ${is58mm ? 'my-1' : 'my-2'}`} />

      {/* Assinatura */}
      <div className={is58mm ? 'mt-2' : 'mt-4'}>
        <div className={`border-t border-black ${is58mm ? 'mt-4' : 'mt-8'} pt-1 text-center`}>
          <p className={is58mm ? 'text-[8px]' : 'text-[10px]'}>Assinatura do Cliente</p>
        </div>
      </div>

      {/* Rodapé */}
      <div className={`text-center ${is58mm ? 'mt-2 text-[6px]' : 'mt-4 text-[8px]'}`}>
        <p>Obrigado pela preferência!</p>
        <p>{format(new Date(), "dd/MM/yyyy HH:mm")}</p>
      </div>
    </div>
  )
}
