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
  // Campos SaaS
  asaas_customer_id?: string
  plano: string
  status_assinatura: StatusAssinatura
  trial_fim?: string
  grace_period_fim?: string
  assinatura_id?: string
  codigo_indicacao?: string
  indicada_por?: string
  meses_bonus: number
  onboarding_completo: boolean
  created_at: string
  updated_at: string
}

export interface Usuario {
  id: string
  auth_id?: string
  empresa_id?: string | null
  nome: string
  email: string
  telefone?: string
  perfil: 'admin' | 'funcionario' | 'superadmin'
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
  codigo_acompanhamento?: string
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
  cancelada: boolean
  data_cancelamento?: string
  motivo_cancelamento?: string
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
export type CategoriaLog = 'auth' | 'venda' | 'os' | 'estoque' | 'sistema' | 'impersonacao'

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

// ============================================
// TIPOS SUPERADMIN
// ============================================

export interface EmpresaStats {
  id: string
  nome: string
  nome_fantasia?: string
  cnpj?: string
  ativo: boolean
  plano: string
  status_assinatura: StatusAssinatura
  trial_fim?: string
  cor_primaria: string
  cor_secundaria: string
  meses_bonus: number
  onboarding_completo: boolean
  created_at: string
  updated_at: string
  usuarios_count: number
  os_count: number
  vendas_count: number
}

export interface PlataformaStats {
  total_empresas: number
  empresas_ativas: number
  total_usuarios: number
  total_os: number
  total_vendas: number
  valor_total_vendas: number
}

// ============================================
// TIPOS SAAS
// ============================================

export type StatusAssinatura = 'trial' | 'active' | 'overdue' | 'suspended' | 'cancelled' | 'expired'

export type CicloAssinatura = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'

export type StatusFatura = 'pending' | 'confirmed' | 'received' | 'overdue' | 'refunded' | 'cancelled'

export type StatusIndicacao = 'pendente' | 'aguardando' | 'qualificada' | 'recompensada' | 'cancelada'

export interface Plano {
  id: string
  nome: string
  slug: string
  descricao?: string
  preco_mensal: number
  preco_anual: number
  max_usuarios: number
  max_produtos: number
  max_os_mes: number
  max_vendas_mes: number
  features: Record<string, boolean | string>
  destaque: boolean
  ativo: boolean
  ordem: number
  created_at: string
  updated_at: string
}

export interface Assinatura {
  id: string
  empresa_id: string
  plano_id: string
  status: StatusAssinatura
  ciclo: CicloAssinatura
  valor: number
  data_inicio: string
  data_fim?: string
  data_cancelamento?: string
  motivo_cancelamento?: string
  asaas_subscription_id?: string
  asaas_customer_id?: string
  created_at: string
  updated_at: string
  // Relacionamentos
  plano?: Plano
  empresa?: Empresa
}

export interface Fatura {
  id: string
  assinatura_id?: string
  empresa_id: string
  valor: number
  status: StatusFatura
  data_vencimento: string
  data_pagamento?: string
  forma_pagamento?: string
  asaas_payment_id?: string
  link_boleto?: string
  link_pix?: string
  link_invoice?: string
  created_at: string
  updated_at: string
  // Relacionamentos
  assinatura?: Assinatura
}

export interface Indicacao {
  id: string
  empresa_origem_id: string
  empresa_indicada_id?: string
  codigo_indicacao: string
  status: StatusIndicacao
  data_cadastro_indicado?: string
  data_contratacao_indicado?: string
  data_qualificacao?: string
  data_recompensa?: string
  created_at: string
  // Relacionamentos
  empresa_origem?: Empresa
  empresa_indicada?: Empresa
}

export interface WebhookLog {
  id: string
  origem: string
  evento: string
  payload: Record<string, unknown>
  processado: boolean
  erro?: string
  created_at: string
}

export interface UsageInfo {
  usuarios_count: number
  usuarios_limit: number
  produtos_count: number
  produtos_limit: number
  os_mes_count: number
  os_mes_limit: number
  vendas_mes_count: number
  vendas_mes_limit: number
}

// ============================================
// TIPOS SUPERADMIN - NOVAS FEATURES
// ============================================

export interface Cupom {
  id: string
  codigo: string
  descricao?: string
  tipo_desconto: 'percentual' | 'fixo'
  valor: number
  valor_minimo: number
  max_usos?: number
  usos_atuais: number
  plano_restrito?: string
  data_inicio: string
  data_expiracao?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export type TipoAviso = 'info' | 'warning' | 'important'
export type AlvoTipoAviso = 'todos' | 'plano' | 'empresa'

export interface AvisoPlataforma {
  id: string
  titulo: string
  mensagem: string
  tipo: TipoAviso
  alvo_tipo: AlvoTipoAviso
  alvo_valor?: string
  ativo: boolean
  criado_por?: string
  created_at: string
  updated_at: string
}

export interface AvisoLido {
  id: string
  aviso_id: string
  empresa_id: string
  lido_em: string
}

export type StatusTicket = 'aberto' | 'em_atendimento' | 'resolvido' | 'fechado'
export type PrioridadeTicket = 'baixa' | 'media' | 'alta' | 'urgente'

export interface TicketSuporte {
  id: string
  empresa_id: string
  usuario_id?: string
  numero: number
  protocolo?: string
  assunto: string
  status: StatusTicket
  prioridade: PrioridadeTicket
  created_at: string
  updated_at: string
  empresa?: { nome: string; nome_fantasia?: string }
  mensagens?: TicketMensagem[]
}

export interface TicketMensagem {
  id: string
  ticket_id: string
  autor_id?: string
  autor_tipo: 'empresa' | 'superadmin'
  mensagem: string
  created_at: string
}

export interface ConfiguracaoPlataforma {
  id: string
  chave: string
  valor: Record<string, unknown>
  updated_at: string
}

export interface ManutencaoConfig {
  ativo: boolean
  mensagem: string
}

export interface ReceitaMensal {
  mes: string
  mrr: number
  novas_assinaturas: number
  receita_total: number
}

export interface ReceitaPorPlano {
  plano: string
  receita: number
  quantidade: number
}

export interface FunilOnboarding {
  total_cadastros: number
  onboarding_completo: number
  primeiro_produto: number
  primeira_venda: number
  assinatura_ativa: number
}

export interface MetricasUso {
  empresas_ativas_7d: number
  empresas_ativas_30d: number
  empresas_inativas_30d: EmpresaInativa[]
  features_mais_usadas: { categoria: string; total: number }[]
  uso_por_empresa: UsoEmpresa[]
}

export interface EmpresaInativa {
  id: string
  nome: string
  nome_fantasia?: string
  ultimo_acesso?: string
}

export interface UsoEmpresa {
  empresa_id: string
  empresa_nome: string
  produtos_count: number
  vendas_count: number
  os_count: number
}

export interface SaasStats {
  mrr: number
  arr: number
  total_assinantes: number
  status_distribuicao: Record<string, number>
  plano_distribuicao: Record<string, number>
  taxa_conversao: number
  churn_rate: number
  cancelamentos_mes: number
  faturas_vencidas: { id: string; empresa_id: string; valor: number; data_vencimento: string }[]
  faturas_vencidas_count: number
  trials_expirando: number
  indicacoes: {
    total: number
    qualificadas: number
    recompensadas: number
    meses_bonus_total: number
    top_indicadores: { empresa_id: string; count: number }[]
  }
}

export interface AlertItem {
  tipo: 'critico' | 'aviso' | 'info'
  categoria: string
  mensagem: string
  empresa_id?: string
  empresa_nome?: string
}

export interface AlertsData {
  alerts: AlertItem[]
  summary: {
    total_empresas: number
    empresas_ativas: number
    total_usuarios: number
    total_erros_24h: number
    total_erros_total: number
    total_alerts: number
    criticos: number
    avisos: number
  }
}

export interface UsuarioGlobal {
  id: string
  auth_id: string
  empresa_id: string
  nome: string
  email: string
  perfil: string
  ativo: boolean
  ultimo_acesso?: string
  created_at: string
  empresas?: { nome: string; nome_fantasia?: string }
}

export interface LogEntry {
  id: string
  tipo: string
  categoria: string | null
  mensagem: string
  detalhes: Record<string, unknown> | null
  pagina: string | null
  acao: string | null
  ip: string | null
  user_agent: string | null
  empresa_id: string | null
  usuario_id: string | null
  created_at: string
  empresas: { nome: string; nome_fantasia: string | null } | null
}
