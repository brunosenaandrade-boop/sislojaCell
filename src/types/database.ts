// ============================================
// TIPOS DO BANCO DE DADOS - SUPABASE
// ============================================

export interface Empresa {
  id: string
  nome: string
  nome_fantasia?: string
  cnpj?: string
  cpf?: string
  email?: string
  telefone?: string
  whatsapp?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  logo_url?: string
  cor_primaria: string
  cor_secundaria: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Usuario {
  id: string
  auth_id?: string
  empresa_id: string
  nome: string
  email: string
  telefone?: string
  perfil: 'admin' | 'funcionario'
  ativo: boolean
  ultimo_acesso?: string
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  empresa_id: string
  nome: string
  cpf?: string
  email?: string
  telefone?: string
  telefone2?: string
  whatsapp?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  data_nascimento?: string
  observacoes?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface CategoriaProduto {
  id: string
  empresa_id: string
  nome: string
  descricao?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Produto {
  id: string
  empresa_id: string
  categoria_id?: string
  codigo?: string
  nome: string
  descricao?: string
  custo: number
  preco_venda: number
  estoque_atual: number
  estoque_minimo: number
  unidade: string
  ativo: boolean
  created_at: string
  updated_at: string
  // Relacionamentos
  categoria?: CategoriaProduto
}

export interface CategoriaServico {
  id: string
  empresa_id: string
  nome: string
  descricao?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Servico {
  id: string
  empresa_id: string
  categoria_id?: string
  nome: string
  descricao?: string
  tipo: 'basico' | 'avancado'
  preco_base: number
  tempo_estimado?: number
  ativo: boolean
  created_at: string
  updated_at: string
  // Relacionamentos
  categoria?: CategoriaServico
}

export type StatusOS =
  | 'aberta'
  | 'em_analise'
  | 'aguardando_peca'
  | 'aguardando_aprovacao'
  | 'em_andamento'
  | 'finalizada'
  | 'entregue'
  | 'cancelada'

export type FormaPagamento = 'dinheiro' | 'pix' | 'debito' | 'credito'

export interface OrdemServico {
  id: string
  empresa_id: string
  cliente_id?: string
  usuario_id?: string
  tecnico_id?: string
  numero: number
  status: StatusOS
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
  diagnostico?: string
  solucao?: string
  valor_servicos: number
  valor_produtos: number
  valor_desconto: number
  valor_total: number
  forma_pagamento?: FormaPagamento
  pago: boolean
  data_pagamento?: string
  data_entrada: string
  data_previsao?: string
  data_finalizacao?: string
  data_entrega?: string
  observacoes?: string
  observacoes_internas?: string
  created_at: string
  updated_at: string
  // Relacionamentos
  cliente?: Cliente
  usuario?: Usuario
  tecnico?: Usuario
  itens?: ItemOS[]
}

export interface ItemOS {
  id: string
  os_id: string
  tipo: 'servico' | 'produto'
  servico_id?: string
  produto_id?: string
  descricao: string
  quantidade: number
  valor_unitario: number
  valor_custo: number
  valor_total: number
  created_at: string
  // Relacionamentos
  servico?: Servico
  produto?: Produto
}

export interface Venda {
  id: string
  empresa_id: string
  cliente_id?: string
  usuario_id?: string
  numero: number
  valor_produtos: number
  valor_custo_total: number
  valor_desconto: number
  valor_total: number
  lucro_liquido: number
  forma_pagamento: FormaPagamento
  observacoes?: string
  created_at: string
  updated_at: string
  // Relacionamentos
  cliente?: Cliente
  usuario?: Usuario
  itens?: ItemVenda[]
}

export interface ItemVenda {
  id: string
  venda_id: string
  produto_id?: string
  descricao: string
  quantidade: number
  valor_unitario: number
  valor_custo: number
  valor_total: number
  lucro_item: number
  created_at: string
  // Relacionamentos
  produto?: Produto
}

export type TipoMovimentacaoEstoque = 'entrada' | 'saida' | 'ajuste' | 'venda' | 'os'

export interface MovimentacaoEstoque {
  id: string
  empresa_id: string
  produto_id: string
  usuario_id?: string
  tipo: TipoMovimentacaoEstoque
  quantidade: number
  estoque_anterior: number
  estoque_posterior: number
  venda_id?: string
  os_id?: string
  motivo?: string
  observacoes?: string
  created_at: string
  // Relacionamentos
  produto?: Produto
  usuario?: Usuario
}

export interface Caixa {
  id: string
  empresa_id: string
  usuario_abertura_id?: string
  usuario_fechamento_id?: string
  data_abertura: string
  data_fechamento?: string
  valor_abertura: number
  valor_fechamento?: number
  total_vendas: number
  total_os: number
  total_entradas: number
  total_saidas: number
  total_esperado: number
  diferenca: number
  status: 'aberto' | 'fechado'
  observacoes?: string
  created_at: string
  updated_at: string
  // Relacionamentos
  usuario_abertura?: Usuario
  usuario_fechamento?: Usuario
}

export type TipoMovimentacaoCaixa = 'venda' | 'os' | 'sangria' | 'suprimento' | 'ajuste'

export interface MovimentacaoCaixa {
  id: string
  caixa_id: string
  usuario_id?: string
  tipo: TipoMovimentacaoCaixa
  valor: number
  venda_id?: string
  os_id?: string
  descricao?: string
  created_at: string
}

export interface Configuracoes {
  id: string
  empresa_id: string
  impressora_termica: boolean
  largura_cupom: number
  proxima_os: number
  proxima_venda: number
  mensagem_cupom?: string
  mensagem_os_entrada?: string
  config_json: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type TipoLog = 'erro' | 'info' | 'warning' | 'audit'
export type CategoriaLog = 'auth' | 'venda' | 'os' | 'estoque' | 'sistema'

export interface LogSistema {
  id: string
  empresa_id?: string
  usuario_id?: string
  tipo: TipoLog
  categoria?: CategoriaLog
  mensagem: string
  detalhes?: Record<string, unknown>
  pagina?: string
  acao?: string
  ip?: string
  user_agent?: string
  created_at: string
}

// ============================================
// TIPOS AUXILIARES
// ============================================

export interface DashboardStats {
  vendas_dia: number
  custo_dia: number
  lucro_dia: number
  os_abertas: number
  os_finalizadas: number
  produtos_estoque_baixo: number
  aniversariantes: Cliente[]
}

export interface RelatorioVendas {
  periodo: string
  total_vendas: number
  total_custo: number
  lucro_liquido: number
  quantidade_vendas: number
  ticket_medio: number
}

export interface RelatorioOS {
  periodo: string
  total_os: number
  os_finalizadas: number
  os_canceladas: number
  valor_total: number
  tempo_medio_atendimento?: number
}
