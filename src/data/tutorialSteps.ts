export type TutorialPosition = 'top' | 'bottom' | 'left' | 'right'

export type TutorialCategory = 'navegacao' | 'vendas' | 'caixa' | 'servicos' | 'estoque' | 'clientes' | 'produtos' | 'configuracoes'

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
  // ============================================
  // NAVEGAÇÃO
  // ============================================
  {
    id: 'sidebar-nav',
    title: 'Menu de Navegação',
    description:
      'Use o menu lateral para acessar todas as seções do sistema: Painel, Clientes, Produtos, Serviços, Vendas, Caixa, Estoque, Ordens de Serviço, Relatórios e Configurações.',
    targetSelector: '[data-tutorial="sidebar-nav"]',
    page: '/dashboard',
    position: 'right',
    category: 'navegacao',
  },
  {
    id: 'dashboard-kpis',
    title: 'Indicadores do Dia',
    description:
      'Acompanhe os principais números do seu negócio: vendas do dia, custo total, lucro líquido e quantidade de ordens de serviço em andamento. Atualizados em tempo real.',
    targetSelector: '[data-tutorial="dashboard-kpis"]',
    page: '/dashboard',
    position: 'bottom',
    category: 'navegacao',
  },
  {
    id: 'dashboard-grafico',
    title: 'Gráfico de Vendas',
    description:
      'Visualize a evolução das suas vendas e lucros na última semana. O gráfico é atualizado automaticamente conforme novas vendas são realizadas.',
    targetSelector: '[data-tutorial="dashboard-grafico"]',
    page: '/dashboard',
    position: 'bottom',
    category: 'navegacao',
  },
  {
    id: 'dashboard-alertas',
    title: 'Alertas de Estoque',
    description:
      'Receba alertas sobre produtos com estoque baixo ou zerado. Clique no alerta para ir diretamente à página de estoque e repor os itens.',
    targetSelector: '[data-tutorial="dashboard-alertas"]',
    page: '/dashboard',
    position: 'left',
    category: 'navegacao',
  },

  // ============================================
  // CLIENTES
  // ============================================
  {
    id: 'clientes-lista',
    title: 'Lista de Clientes',
    description:
      'Visualize todos os seus clientes cadastrados. Use a busca para encontrar por nome, telefone ou CPF/CNPJ. Clique no nome do cliente para ver detalhes.',
    targetSelector: '[data-tutorial="clientes-lista"]',
    page: '/clientes',
    position: 'top',
    category: 'clientes',
  },
  {
    id: 'clientes-novo',
    title: 'Cadastrar Cliente',
    description:
      'Clique aqui para cadastrar um novo cliente. Preencha nome, telefone, email e endereço. O CEP preenche automaticamente a cidade e estado.',
    targetSelector: '[data-tutorial="clientes-novo"]',
    page: '/clientes',
    position: 'bottom',
    category: 'clientes',
  },
  {
    id: 'clientes-historico',
    title: 'Histórico do Cliente',
    description:
      'Na página de detalhes do cliente, você encontra o histórico completo de compras e ordens de serviço. Útil para conhecer o perfil de cada cliente.',
    targetSelector: '[data-tutorial="clientes-historico"]',
    page: '/clientes',
    position: 'top',
    category: 'clientes',
  },

  // ============================================
  // PRODUTOS
  // ============================================
  {
    id: 'produtos-lista',
    title: 'Catálogo de Produtos',
    description:
      'Gerencie seu catálogo de produtos. Veja nome, código, preço, estoque e margem de lucro. Clique no nome do produto para editá-lo.',
    targetSelector: '[data-tutorial="produtos-lista"]',
    page: '/produtos',
    position: 'top',
    category: 'produtos',
  },
  {
    id: 'produtos-novo',
    title: 'Novo Produto',
    description:
      'Cadastre novos produtos com nome, código, categoria, custo e preço de venda. Lembre-se: use PONTO como decimal (ex: 50.00 para R$ 50,00).',
    targetSelector: '[data-tutorial="produtos-novo"]',
    page: '/produtos',
    position: 'bottom',
    category: 'produtos',
  },
  {
    id: 'produtos-categorias',
    title: 'Categorias',
    description:
      'Organize seus produtos em categorias (ex: Capas, Películas, Cabos). Isso facilita a busca no PDV e a organização do seu catálogo.',
    targetSelector: '[data-tutorial="produtos-categorias"]',
    page: '/produtos/categorias',
    position: 'top',
    category: 'produtos',
  },

  // ============================================
  // SERVIÇOS
  // ============================================
  {
    id: 'servicos-lista',
    title: 'Catálogo de Serviços',
    description:
      'Cadastre os serviços oferecidos pela sua assistência: troca de tela, bateria, reparo de placa, etc. Defina preço base e tempo estimado para cada um.',
    targetSelector: '[data-tutorial="servicos-lista"]',
    page: '/servicos',
    position: 'top',
    category: 'servicos',
  },
  {
    id: 'servicos-novo',
    title: 'Novo Serviço',
    description:
      'Clique para cadastrar um novo serviço. Informe nome, descrição, tipo (básico ou avançado), preço base e tempo estimado em minutos.',
    targetSelector: '[data-tutorial="servicos-novo"]',
    page: '/servicos',
    position: 'bottom',
    category: 'servicos',
  },

  // ============================================
  // VENDAS (PDV)
  // ============================================
  {
    id: 'pdv-search',
    title: 'Busca de Produtos',
    description:
      'Digite o nome ou código do produto para adicioná-lo ao carrinho. Use o atalho F2 para focar rapidamente neste campo de busca.',
    targetSelector: '[data-tutorial="pdv-search"]',
    page: '/vendas',
    position: 'bottom',
    category: 'vendas',
  },
  {
    id: 'pdv-produtos',
    title: 'Resultados da Busca',
    description:
      'Os produtos encontrados aparecem aqui. Clique no produto desejado para adicioná-lo ao carrinho. Veja o preço e estoque disponível.',
    targetSelector: '[data-tutorial="pdv-produtos"]',
    page: '/vendas',
    position: 'right',
    category: 'vendas',
  },
  {
    id: 'pdv-cart',
    title: 'Carrinho de Compras',
    description:
      'Os produtos adicionados aparecem aqui. Altere quantidades, remova itens ou aplique descontos. O total é atualizado em tempo real.',
    targetSelector: '[data-tutorial="pdv-cart"]',
    page: '/vendas',
    position: 'top',
    category: 'vendas',
  },
  {
    id: 'pdv-cliente',
    title: 'Selecionar Cliente',
    description:
      'Vincule um cliente à venda para manter o histórico de compras. É opcional, mas recomendado para fidelização e emissão de nota com CPF.',
    targetSelector: '[data-tutorial="pdv-cliente"]',
    page: '/vendas',
    position: 'bottom',
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
    id: 'pdv-atalhos',
    title: 'Atalhos do PDV',
    description:
      'Memorize os atalhos para agilizar: F2 (buscar produto), F4 (finalizar venda), F8 (cancelar), Escape (limpar busca). Com prática, você vende muito mais rápido!',
    targetSelector: '[data-tutorial="pdv-atalhos"]',
    page: '/vendas',
    position: 'bottom',
    category: 'vendas',
  },

  // ============================================
  // CAIXA
  // ============================================
  {
    id: 'caixa-status',
    title: 'Status do Caixa',
    description:
      'Veja se o caixa está aberto ou fechado. Para realizar vendas, o caixa precisa estar aberto. Informe o valor de troco inicial ao abrir.',
    targetSelector: '[data-tutorial="caixa-status"]',
    page: '/caixa',
    position: 'bottom',
    category: 'caixa',
  },
  {
    id: 'caixa-resumo',
    title: 'Resumo do Caixa',
    description:
      'Acompanhe em tempo real: valor inicial, entradas (vendas), saídas (sangrias), suprimentos e saldo atual esperado no caixa.',
    targetSelector: '[data-tutorial="caixa-resumo"]',
    page: '/caixa',
    position: 'bottom',
    category: 'caixa',
  },
  {
    id: 'caixa-movimentacoes',
    title: 'Movimentações',
    description:
      'Histórico completo de todas as operações do caixa: vendas, ordens de serviço, suprimentos e sangrias. Cada registro mostra horário e valor.',
    targetSelector: '[data-tutorial="caixa-movimentacoes"]',
    page: '/caixa',
    position: 'top',
    category: 'caixa',
  },
  {
    id: 'caixa-sangria',
    title: 'Sangria e Suprimento',
    description:
      'Sangria: retire dinheiro do caixa (ex: depósito bancário). Suprimento: adicione dinheiro (ex: reforço de troco). Registre sempre para manter o controle.',
    targetSelector: '[data-tutorial="caixa-sangria"]',
    page: '/caixa',
    position: 'left',
    category: 'caixa',
  },
  {
    id: 'caixa-fechar',
    title: 'Fechar Caixa',
    description:
      'No fim do dia, conte o dinheiro físico e informe o valor. O sistema compara com o esperado e mostra a diferença, se houver.',
    targetSelector: '[data-tutorial="caixa-fechar"]',
    page: '/caixa',
    position: 'top',
    category: 'caixa',
  },

  // ============================================
  // ESTOQUE
  // ============================================
  {
    id: 'estoque-lista',
    title: 'Controle de Estoque',
    description:
      'Visualize todos os produtos com quantidade atual, valor em estoque e status. Produtos com estoque baixo ficam destacados em vermelho.',
    targetSelector: '[data-tutorial="estoque-lista"]',
    page: '/estoque',
    position: 'top',
    category: 'estoque',
  },
  {
    id: 'estoque-alertas',
    title: 'Alertas de Estoque Baixo',
    description:
      'Produtos com estoque menor ou igual ao mínimo configurado aparecem aqui. Configure o estoque mínimo de cada produto para receber alertas.',
    targetSelector: '[data-tutorial="estoque-alertas"]',
    page: '/estoque',
    position: 'bottom',
    category: 'estoque',
  },
  {
    id: 'estoque-entrada',
    title: 'Entrada de Estoque',
    description:
      'Use para registrar entrada de mercadoria (compra de fornecedor). A quantidade informada é SOMADA ao estoque atual.',
    targetSelector: '[data-tutorial="estoque-entrada"]',
    page: '/estoque',
    position: 'left',
    category: 'estoque',
  },
  {
    id: 'estoque-saida',
    title: 'Saída de Estoque',
    description:
      'Use para registrar perdas, avarias ou uso interno. A quantidade é SUBTRAÍDA do estoque. Vendas e ordens de serviço baixam automaticamente.',
    targetSelector: '[data-tutorial="estoque-saida"]',
    page: '/estoque',
    position: 'left',
    category: 'estoque',
  },
  {
    id: 'estoque-definir',
    title: 'Definir Estoque',
    description:
      'Use para CORRIGIR o estoque após inventário. O valor informado SUBSTITUI o atual (não soma). Ideal para ajustes de inventário.',
    targetSelector: '[data-tutorial="estoque-definir"]',
    page: '/estoque',
    position: 'left',
    category: 'estoque',
  },

  // ============================================
  // ORDENS DE SERVIÇO
  // ============================================
  {
    id: 'os-list',
    title: 'Lista de Ordens de Serviço',
    description:
      'Gerencie todas as ordens de serviço: filtre por status (Aberta, Em Andamento, Pronta, etc.), busque por cliente ou aparelho e acompanhe cada reparo.',
    targetSelector: '[data-tutorial="os-list"]',
    page: '/ordens-servico',
    position: 'top',
    category: 'servicos',
  },
  {
    id: 'os-nova',
    title: 'Nova Ordem de Serviço',
    description:
      'Clique para criar uma nova ordem de serviço. Selecione o cliente, descreva o problema, informe o aparelho e defina prazo de entrega.',
    targetSelector: '[data-tutorial="os-nova"]',
    page: '/ordens-servico',
    position: 'bottom',
    category: 'servicos',
  },
  {
    id: 'os-status',
    title: 'Status da Ordem de Serviço',
    description:
      'Atualize o status conforme o progresso: Aberta → Em Andamento → Aguardando Peças → Pronta → Entregue. O cliente pode ser notificado.',
    targetSelector: '[data-tutorial="os-status"]',
    page: '/ordens-servico',
    position: 'right',
    category: 'servicos',
  },
  {
    id: 'os-itens',
    title: 'Produtos e Serviços na Ordem de Serviço',
    description:
      'Adicione os produtos utilizados (peças) e serviços realizados. O estoque é baixado automaticamente e o valor total calculado.',
    targetSelector: '[data-tutorial="os-itens"]',
    page: '/ordens-servico',
    position: 'top',
    category: 'servicos',
  },

  // ============================================
  // CONFIGURAÇÕES
  // ============================================
  {
    id: 'config-empresa',
    title: 'Dados da Empresa',
    description:
      'Configure nome, CNPJ, endereço, telefone e logo da sua empresa. Essas informações aparecem nos cupons e documentos impressos.',
    targetSelector: '[data-tutorial="config-empresa"]',
    page: '/configuracoes',
    position: 'right',
    category: 'configuracoes',
  },
  {
    id: 'config-usuarios',
    title: 'Usuários do Sistema',
    description:
      'Cadastre funcionários com diferentes níveis de acesso: Admin (acesso total), Operador (sem exclusão) ou Vendedor (apenas vendas e ordens de serviço).',
    targetSelector: '[data-tutorial="config-usuarios"]',
    page: '/configuracoes/usuarios',
    position: 'top',
    category: 'configuracoes',
  },
  {
    id: 'config-impressao',
    title: 'Configuração de Impressão',
    description:
      'Configure sua impressora térmica (58mm ou 80mm) para imprimir cupons de venda e ordens de serviço. Teste a impressão antes de usar.',
    targetSelector: '[data-tutorial="config-impressao"]',
    page: '/configuracoes',
    position: 'right',
    category: 'configuracoes',
  },
]

export const quickTipsByPage: Record<string, { title: string; tips: string[] }> = {
  '/dashboard': {
    title: 'Dicas do Painel',
    tips: [
      'Os cards superiores mostram o resumo financeiro do dia.',
      'O gráfico exibe a evolução de vendas e lucro da semana.',
      'Clique em "Ver todas" para acessar a lista completa de vendas ou ordens de serviço.',
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
      'Filtre por status para encontrar rapidamente.',
      'Cada ordem pode ser visualizada, editada ou impressa.',
      'Ordens com status "Finalizada" podem ser cobradas e entregues.',
      'Use a busca para encontrar por número, cliente ou aparelho.',
    ],
  },
  '/estoque': {
    title: 'Dicas de Estoque',
    tips: [
      'Produtos com estoque abaixo do mínimo ficam destacados.',
      'Use "Entrada" para receber mercadorias (soma ao estoque).',
      'Use "Definir Estoque" para corrigir inventário (substitui o valor).',
      'Saídas de vendas e ordens de serviço são registradas automaticamente.',
      'Exporte o relatório de estoque em CSV para controle.',
    ],
  },
  '/clientes': {
    title: 'Dicas de Clientes',
    tips: [
      'Cadastre clientes para associar vendas e ordens de serviço.',
      'Busque por nome, telefone ou CPF/CNPJ.',
      'O CEP preenche automaticamente cidade e estado.',
      'Veja o histórico completo de compras e ordens de serviço de cada cliente.',
    ],
  },
  '/produtos': {
    title: 'Dicas de Produtos',
    tips: [
      'Use PONTO como decimal nos preços (ex: 50.00 para R$ 50,00).',
      'Clique no nome do produto para editar.',
      'Organize por categorias para facilitar a busca no PDV.',
      'Defina o estoque mínimo para receber alertas.',
      'A margem de lucro é calculada automaticamente.',
    ],
  },
  '/servicos': {
    title: 'Dicas de Serviços',
    tips: [
      'Cadastre todos os serviços com preço base e tempo estimado.',
      'Serviços básicos: reparos simples. Avançados: reparos complexos.',
      'O tempo estimado ajuda a definir prazos nas ordens de serviço.',
      'Serviços inativos não aparecem na lista de seleção.',
    ],
  },
  '/configuracoes': {
    title: 'Dicas de Configurações',
    tips: [
      'Complete os dados da empresa para personalizar os cupons.',
      'Configure a impressora térmica antes de imprimir.',
      'Crie usuários com diferentes níveis de permissão.',
      'Seus dados são salvos na nuvem automaticamente.',
    ],
  },
}
