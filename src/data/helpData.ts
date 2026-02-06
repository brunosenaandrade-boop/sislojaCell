import {
  Rocket,
  Package,
  Warehouse,
  ShoppingCart,
  DollarSign,
  FileText,
  Settings,
  LucideIcon,
} from 'lucide-react'

export interface FAQ {
  pergunta: string
  resposta: string
}

export interface Guia {
  titulo: string
  passos: string[]
}

export interface Dica {
  titulo: string
  descricao: string
}

export interface CategoriaAjuda {
  id: string
  titulo: string
  icon: LucideIcon
  faqs: FAQ[]
  guias: Guia[]
  dicas: Dica[]
}

export const categoriasAjuda: CategoriaAjuda[] = [
  {
    id: 'primeiros-passos',
    titulo: 'Primeiros Passos',
    icon: Rocket,
    faqs: [
      {
        pergunta: 'Como começar a usar o CellFlow?',
        resposta: 'Após o cadastro, configure os dados da sua empresa em Configurações, cadastre suas categorias de produtos, adicione seus produtos e pronto! Você já pode começar a vender pelo PDV e gerenciar ordens de serviço.',
      },
      {
        pergunta: 'Como configurar os dados da minha empresa?',
        resposta: 'Acesse Configurações > Dados da Empresa. Lá você pode adicionar nome, CNPJ, endereço, telefone e logo. Essas informações aparecerão nos cupons e documentos gerados.',
      },
      {
        pergunta: 'Como criar usuários para minha equipe?',
        resposta: 'Em Configurações > Usuários, clique em "Novo Usuário". Defina nome, email, senha e o perfil (admin, operador ou vendedor). Cada perfil tem permissões diferentes.',
      },
      {
        pergunta: 'Qual a diferença entre os perfis de usuário?',
        resposta: 'Admin: acesso total, pode excluir registros e ver relatórios. Operador: pode cadastrar e editar, mas não excluir. Vendedor: apenas operações de venda e OS.',
      },
    ],
    guias: [
      {
        titulo: 'Configuração inicial em 5 passos',
        passos: [
          'Acesse Configurações e preencha os dados da empresa',
          'Vá em Produtos > Categorias e crie suas categorias',
          'Cadastre seus produtos com custo e preço de venda',
          'Cadastre seus serviços (se aplicável)',
          'Faça uma venda teste no PDV para validar',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Tour Guiado',
        descricao: 'Use o botão "Iniciar Tour Guiado" no topo desta página para conhecer as principais funções do sistema.',
      },
    ],
  },
  {
    id: 'produtos',
    titulo: 'Produtos',
    icon: Package,
    faqs: [
      {
        pergunta: 'Como informar valores em reais nos campos de preço?',
        resposta: 'Use PONTO como separador decimal. Exemplo: para R$ 3,20 digite 3.20. Para R$ 1.500,00 digite 1500.00. O sistema usa o formato americano nos inputs numéricos.',
      },
      {
        pergunta: 'Qual a diferença entre Custo e Preço de Venda?',
        resposta: 'Custo é quanto você paga pelo produto (compra do fornecedor). Preço de Venda é quanto você cobra do cliente. A diferença é seu lucro. O sistema calcula automaticamente a margem de lucro.',
      },
      {
        pergunta: 'Como editar um produto?',
        resposta: 'Na lista de produtos (/produtos), clique no NOME do produto para ir direto à edição. Ou clique no menu de três pontos e selecione "Editar".',
      },
      {
        pergunta: 'O que é o código do produto?',
        resposta: 'É um identificador único para busca rápida. Pode ser o código de barras ou um código interno. Use o botão "Gerar" para criar um automaticamente.',
      },
      {
        pergunta: 'Como desativar um produto sem excluir?',
        resposta: 'Na edição do produto, clique no botão "Ativo" para mudar para "Inativo". Produtos inativos não aparecem no PDV mas continuam no histórico.',
      },
    ],
    guias: [
      {
        titulo: 'Cadastrar um novo produto',
        passos: [
          'Acesse Produtos > Novo Produto',
          'Preencha o nome e selecione a categoria',
          'Informe o Custo usando ponto decimal (ex: 50.00)',
          'Informe o Preço de Venda (ex: 89.90)',
          'Defina o estoque inicial e mínimo',
          'Clique em Salvar',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Margem de lucro saudável',
        descricao: 'O sistema indica margem em cores: verde (>50%), azul (30-50%), laranja (<30%). Margens abaixo de 30% podem não cobrir custos operacionais.',
      },
    ],
  },
  {
    id: 'estoque',
    titulo: 'Estoque',
    icon: Warehouse,
    faqs: [
      {
        pergunta: 'Qual a diferença entre Entrada, Saída e Definir Estoque?',
        resposta: 'ENTRADA: soma a quantidade ao estoque atual (ex: recebeu mercadoria). SAÍDA: subtrai do estoque (ex: perda, avaria). DEFINIR ESTOQUE: substitui o valor atual pelo novo (ex: correção após inventário).',
      },
      {
        pergunta: 'Por que meu estoque somou em vez de definir o valor?',
        resposta: 'Se você usou "Entrada de Estoque", ele soma ao atual. Para CORRIGIR o estoque para um valor exato, use "Definir Estoque" (ícone de refresh). Isso substitui o valor ao invés de somar.',
      },
      {
        pergunta: 'O que é Estoque Baixo?',
        resposta: 'Quando o estoque atual é MENOR OU IGUAL ao estoque mínimo configurado no produto. Exemplo: mínimo 5, atual 5 = estoque baixo. Configure o mínimo de cada produto para receber alertas.',
      },
      {
        pergunta: 'Como corrigir o estoque após inventário?',
        resposta: 'Use a opção "Definir Estoque" na página de Estoque. Selecione o produto, escolha "Definir Estoque" e informe a quantidade real encontrada. Adicione uma observação como "Correção de inventário".',
      },
      {
        pergunta: 'O estoque baixa automaticamente nas vendas?',
        resposta: 'Sim! Ao finalizar uma venda no PDV, o estoque dos produtos vendidos é automaticamente decrementado.',
      },
      {
        pergunta: 'O estoque baixa automaticamente nas OS?',
        resposta: 'Sim, ao adicionar produtos em uma Ordem de Serviço, o estoque é automaticamente decrementado.',
      },
    ],
    guias: [
      {
        titulo: 'Fazer correção de inventário',
        passos: [
          'Acesse a página Estoque',
          'Localize o produto a corrigir',
          'Clique em "Definir Estoque" (ícone de refresh)',
          'Informe a quantidade REAL em estoque',
          'Adicione observação: "Correção de inventário"',
          'Confirme a operação',
        ],
      },
      {
        titulo: 'Registrar entrada de mercadoria',
        passos: [
          'Acesse a página Estoque',
          'Localize o produto',
          'Clique em "Entrada de Estoque"',
          'Informe a quantidade recebida',
          'Adicione o número da nota fiscal na observação',
          'Confirme a operação',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Valor em Estoque',
        descricao: 'O "Valor em Estoque" é calculado como: Custo x Quantidade. Se o valor parece errado, verifique se o custo do produto está correto.',
      },
    ],
  },
  {
    id: 'vendas',
    titulo: 'Vendas (PDV)',
    icon: ShoppingCart,
    faqs: [
      {
        pergunta: 'Como fazer uma venda rápida?',
        resposta: 'No PDV, busque o produto pelo nome ou código, clique para adicionar ao carrinho, ajuste quantidade se necessário, selecione forma de pagamento e finalize.',
      },
      {
        pergunta: 'Como aplicar desconto?',
        resposta: 'No carrinho, você pode aplicar desconto por item ou no total. Clique no valor e informe o desconto em reais ou percentual.',
      },
      {
        pergunta: 'Quais são os atalhos do PDV?',
        resposta: 'F2: Buscar produto. F4: Finalizar venda. F8: Cancelar venda. Esc: Limpar busca. Use os atalhos para agilizar o atendimento.',
      },
      {
        pergunta: 'Como cancelar uma venda já finalizada?',
        resposta: 'Na lista de vendas, localize a venda, clique no menu e selecione "Estornar". O estoque será automaticamente devolvido.',
      },
      {
        pergunta: 'Como vincular um cliente à venda?',
        resposta: 'No PDV, clique em "Selecionar Cliente" antes de finalizar. Isso permite emitir nota com CPF e manter histórico de compras.',
      },
    ],
    guias: [
      {
        titulo: 'Realizar uma venda completa',
        passos: [
          'Acesse Vendas (PDV)',
          'Busque e adicione os produtos (F2 para buscar)',
          'Ajuste quantidades se necessário',
          'Selecione o cliente (opcional)',
          'Aplique desconto se necessário',
          'Escolha forma de pagamento',
          'Finalize a venda (F4)',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Atalhos economizam tempo',
        descricao: 'Memorize F2 (buscar) e F4 (finalizar). Com prática, você faz uma venda em segundos sem usar o mouse.',
      },
    ],
  },
  {
    id: 'caixa',
    titulo: 'Caixa',
    icon: DollarSign,
    faqs: [
      {
        pergunta: 'Por que preciso abrir o caixa?',
        resposta: 'O controle de caixa permite acompanhar entradas e saídas de dinheiro, fazer fechamento diário e identificar divergências. É essencial para controle financeiro.',
      },
      {
        pergunta: 'O que é Sangria?',
        resposta: 'Sangria é a retirada de dinheiro do caixa (ex: para depósito bancário, pagamento de fornecedor). Registre sempre para manter o controle.',
      },
      {
        pergunta: 'O que é Suprimento?',
        resposta: 'Suprimento é a entrada de dinheiro no caixa que não vem de vendas (ex: troco inicial, reforço de caixa).',
      },
      {
        pergunta: 'O que fazer se o caixa não fechar?',
        resposta: 'Verifique: 1) Todas as vendas em dinheiro foram registradas? 2) Sangrias e suprimentos estão corretos? 3) Houve troco errado? Registre a diferença como ajuste.',
      },
      {
        pergunta: 'Como informar o valor de abertura do caixa?',
        resposta: 'Use PONTO como separador decimal (ex: 200.00 para R$ 200,00). Você também pode usar vírgula, o sistema aceita ambos os formatos.',
      },
    ],
    guias: [
      {
        titulo: 'Rotina diária de caixa',
        passos: [
          'Abra o caixa informando o valor inicial (troco)',
          'Realize as vendas normalmente',
          'Registre sangrias quando retirar dinheiro',
          'No fim do dia, conte o dinheiro físico',
          'Feche o caixa informando valor em espécie',
          'Analise o relatório de fechamento',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Confira o caixa periodicamente',
        descricao: 'Não espere o fim do dia para conferir. Uma conferência rápida após o almoço ajuda a identificar problemas cedo.',
      },
    ],
  },
  {
    id: 'ordens-servico',
    titulo: 'Ordens de Serviço',
    icon: FileText,
    faqs: [
      {
        pergunta: 'Como criar uma ordem de serviço?',
        resposta: 'Acesse Ordens de Serviço > Nova OS. Selecione o cliente, descreva o problema/serviço, adicione produtos e serviços, defina prazo e salve.',
      },
      {
        pergunta: 'Quais são os status de uma OS?',
        resposta: 'Aberta (aguardando início), Em Andamento (sendo executada), Aguardando Peças, Aguardando Aprovação, Pronta (finalizada), Entregue (cliente retirou), Cancelada.',
      },
      {
        pergunta: 'Como adicionar produtos a uma OS?',
        resposta: 'Na edição da OS, vá na aba "Produtos/Serviços", busque o produto e adicione. O estoque será decrementado automaticamente.',
      },
      {
        pergunta: 'Como imprimir a OS?',
        resposta: 'Na visualização da OS, clique em "Imprimir". O documento inclui dados do cliente, itens, valores e termos de garantia.',
      },
    ],
    guias: [
      {
        titulo: 'Fluxo completo de uma OS',
        passos: [
          'Crie a OS com dados do cliente e descrição',
          'Mude para "Em Andamento" ao iniciar',
          'Adicione produtos/serviços utilizados',
          'Mude para "Pronta" ao finalizar',
          'Notifique o cliente',
          'Receba o pagamento',
          'Mude para "Entregue" na retirada',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Prazos realistas',
        descricao: 'Defina prazos com margem de segurança. É melhor entregar antes do prazo do que atrasar.',
      },
    ],
  },
  {
    id: 'configuracoes',
    titulo: 'Configurações',
    icon: Settings,
    faqs: [
      {
        pergunta: 'Como alterar a logo da empresa?',
        resposta: 'Em Configurações > Dados da Empresa, clique na área da logo para fazer upload. Use uma imagem quadrada para melhor resultado.',
      },
      {
        pergunta: 'Como configurar a impressora?',
        resposta: 'Em Configurações > Impressão, selecione o modelo de impressora térmica. O sistema suporta impressoras de 58mm e 80mm.',
      },
      {
        pergunta: 'Como alterar minha senha?',
        resposta: 'Clique no seu nome no canto superior direito > Minha Conta > Alterar Senha.',
      },
      {
        pergunta: 'Como sair do sistema?',
        resposta: 'Clique no seu nome no canto superior direito e depois em "Sair". Isso encerra sua sessão com segurança.',
      },
    ],
    guias: [
      {
        titulo: 'Personalizar o sistema',
        passos: [
          'Acesse Configurações',
          'Adicione a logo da sua empresa',
          'Defina a cor primária da marca',
          'Configure os dados fiscais (CNPJ)',
          'Preencha endereço completo',
          'Salve as alterações',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Backup dos dados',
        descricao: 'Seus dados são armazenados na nuvem com backup automático. Você não precisa se preocupar com perda de dados.',
      },
    ],
  },
]

export function buscarNaAjuda(termo: string): CategoriaAjuda[] {
  if (!termo.trim()) return categoriasAjuda

  const termoLower = termo.toLowerCase()

  return categoriasAjuda
    .map((categoria) => {
      const faqsFiltradas = categoria.faqs.filter(
        (faq) =>
          faq.pergunta.toLowerCase().includes(termoLower) ||
          faq.resposta.toLowerCase().includes(termoLower)
      )

      const guiasFiltrados = categoria.guias.filter(
        (guia) =>
          guia.titulo.toLowerCase().includes(termoLower) ||
          guia.passos.some((passo) => passo.toLowerCase().includes(termoLower))
      )

      const dicasFiltradas = categoria.dicas.filter(
        (dica) =>
          dica.titulo.toLowerCase().includes(termoLower) ||
          dica.descricao.toLowerCase().includes(termoLower)
      )

      if (faqsFiltradas.length || guiasFiltrados.length || dicasFiltradas.length) {
        return {
          ...categoria,
          faqs: faqsFiltradas,
          guias: guiasFiltrados,
          dicas: dicasFiltradas,
        }
      }

      return null
    })
    .filter(Boolean) as CategoriaAjuda[]
}
