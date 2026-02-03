export type TutorialPosition = 'top' | 'bottom' | 'left' | 'right'

export type TutorialCategory = 'navegacao' | 'vendas' | 'caixa' | 'servicos' | 'estoque'

export interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector: string
  page: string
  position: TutorialPosition
  category: TutorialCategory
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'sidebar-nav',
    title: 'Navegação Lateral',
    description:
      'Use o menu lateral para navegar entre as diferentes seções do sistema: Dashboard, Clientes, Produtos, Vendas, Caixa e muito mais.',
    targetSelector: '[data-tutorial="sidebar-nav"]',
    page: '/dashboard',
    position: 'right',
    category: 'navegacao',
  },
  {
    id: 'dashboard-kpis',
    title: 'Resumo do Dia',
    description:
      'Aqui você encontra os principais indicadores do seu negócio: vendas do dia, custo, lucro líquido e ordens de serviço em andamento.',
    targetSelector: '[data-tutorial="dashboard-kpis"]',
    page: '/dashboard',
    position: 'bottom',
    category: 'navegacao',
  },
  {
    id: 'pdv-search',
    title: 'Busca de Produtos',
    description:
      'Digite o nome ou código do produto para adicioná-lo ao carrinho. Use o atalho F2 para focar rapidamente neste campo.',
    targetSelector: '[data-tutorial="pdv-search"]',
    page: '/vendas',
    position: 'bottom',
    category: 'vendas',
  },
  {
    id: 'pdv-cart',
    title: 'Carrinho de Compras',
    description:
      'Os produtos adicionados aparecem aqui. Você pode alterar quantidades, remover itens e acompanhar o total da venda em tempo real.',
    targetSelector: '[data-tutorial="pdv-cart"]',
    page: '/vendas',
    position: 'top',
    category: 'vendas',
  },
  {
    id: 'pdv-finalizar',
    title: 'Finalizar Venda',
    description:
      'Quando o carrinho estiver pronto, clique aqui (ou pressione F4) para escolher a forma de pagamento e concluir a venda.',
    targetSelector: '[data-tutorial="pdv-finalizar"]',
    page: '/vendas',
    position: 'top',
    category: 'vendas',
  },
  {
    id: 'caixa-status',
    title: 'Status do Caixa',
    description:
      'Veja se o caixa está aberto ou fechado. Abra o caixa informando o valor de troco inicial e feche ao final do dia com a conferência.',
    targetSelector: '[data-tutorial="caixa-status"]',
    page: '/caixa',
    position: 'bottom',
    category: 'caixa',
  },
  {
    id: 'caixa-movimentacoes',
    title: 'Movimentações do Caixa',
    description:
      'Acompanhe todas as entradas e saídas do caixa: vendas, ordens de serviço, suprimentos e sangrias registradas no dia.',
    targetSelector: '[data-tutorial="caixa-movimentacoes"]',
    page: '/caixa',
    position: 'top',
    category: 'caixa',
  },
  {
    id: 'os-list',
    title: 'Ordens de Serviço',
    description:
      'Gerencie todas as ordens de serviço: filtre por status, busque por cliente ou aparelho e acompanhe o progresso de cada reparo.',
    targetSelector: '[data-tutorial="os-list"]',
    page: '/ordens-servico',
    position: 'top',
    category: 'servicos',
  },
  {
    id: 'estoque-alertas',
    title: 'Alertas de Estoque',
    description:
      'Fique atento aos alertas de estoque baixo e produtos zerados. Mantenha seu estoque sempre atualizado para não perder vendas.',
    targetSelector: '[data-tutorial="estoque-alertas"]',
    page: '/estoque',
    position: 'bottom',
    category: 'estoque',
  },
]

export const quickTipsByPage: Record<string, { title: string; tips: string[] }> = {
  '/dashboard': {
    title: 'Dicas do Dashboard',
    tips: [
      'Os cards superiores mostram o resumo financeiro do dia.',
      'O gráfico exibe a evolução de vendas e lucro da semana.',
      'Clique em "Ver todas" para acessar a lista completa de vendas ou OS.',
      'Alertas de estoque baixo aparecem automaticamente.',
    ],
  },
  '/vendas': {
    title: 'Dicas do PDV',
    tips: [
      'Pressione F2 para focar na busca de produtos.',
      'Pressione F4 para abrir a finalização da venda.',
      'Pressione Escape para limpar a busca.',
      'Você pode selecionar um cliente antes de finalizar (opcional).',
      'O lucro estimado é exibido em tempo real no resumo.',
    ],
  },
  '/caixa': {
    title: 'Dicas do Caixa',
    tips: [
      'Abra o caixa no início do dia com o valor de troco.',
      'Registre suprimentos e sangrias para manter o controle.',
      'Ao fechar, informe o valor contado para conferência automática.',
      'O histórico de caixas anteriores fica na aba "Histórico".',
    ],
  },
  '/ordens-servico': {
    title: 'Dicas de Ordens de Serviço',
    tips: [
      'Filtre as OS por status para encontrar rapidamente.',
      'Cada OS pode ser visualizada, editada ou impressa.',
      'OS com status "Finalizada" podem ser cobradas e entregues.',
      'Use a busca para encontrar por número, cliente ou aparelho.',
    ],
  },
  '/estoque': {
    title: 'Dicas de Estoque',
    tips: [
      'Produtos com estoque abaixo do mínimo ficam destacados.',
      'Registre entradas ao receber mercadorias do fornecedor.',
      'Saídas são registradas automaticamente nas vendas e OS.',
      'Exporte o relatório de estoque em CSV para controle.',
    ],
  },
  '/clientes': {
    title: 'Dicas de Clientes',
    tips: [
      'Cadastre clientes para associar vendas e ordens de serviço.',
      'Busque por nome, telefone ou CPF.',
      'Clientes inativos podem ser reativados a qualquer momento.',
    ],
  },
  '/produtos': {
    title: 'Dicas de Produtos',
    tips: [
      'Cadastre produtos com custo e preço de venda para calcular lucro.',
      'Organize por categorias para facilitar a busca no PDV.',
      'Defina o estoque mínimo para receber alertas.',
    ],
  },
}
