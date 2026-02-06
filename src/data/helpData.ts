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
        pergunta: 'Como comecar a usar o CellFlow?',
        resposta: 'Apos o cadastro, configure os dados da sua empresa em Configuracoes, cadastre suas categorias de produtos, adicione seus produtos e pronto! Voce ja pode comecar a vender pelo PDV e gerenciar ordens de servico.',
      },
      {
        pergunta: 'Como configurar os dados da minha empresa?',
        resposta: 'Acesse Configuracoes > Dados da Empresa. La voce pode adicionar nome, CNPJ, endereco, telefone e logo. Essas informacoes aparecerao nos cupons e documentos gerados.',
      },
      {
        pergunta: 'Como criar usuarios para minha equipe?',
        resposta: 'Em Configuracoes > Usuarios, clique em "Novo Usuario". Defina nome, email, senha e o perfil (admin, operador ou vendedor). Cada perfil tem permissoes diferentes.',
      },
      {
        pergunta: 'Qual a diferenca entre os perfis de usuario?',
        resposta: 'Admin: acesso total, pode excluir registros e ver relatorios. Operador: pode cadastrar e editar, mas nao excluir. Vendedor: apenas operacoes de venda e OS.',
      },
    ],
    guias: [
      {
        titulo: 'Configuracao inicial em 5 passos',
        passos: [
          'Acesse Configuracoes e preencha os dados da empresa',
          'Va em Produtos > Categorias e crie suas categorias',
          'Cadastre seus produtos com custo e preco de venda',
          'Cadastre seus servicos (se aplicavel)',
          'Faca uma venda teste no PDV para validar',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Tour Guiado',
        descricao: 'Use o botao "Iniciar Tour Guiado" no topo desta pagina para conhecer as principais funcoes do sistema.',
      },
    ],
  },
  {
    id: 'produtos',
    titulo: 'Produtos',
    icon: Package,
    faqs: [
      {
        pergunta: 'Como informar valores em reais nos campos de preco?',
        resposta: 'Use PONTO como separador decimal. Exemplo: para R$ 3,20 digite 3.20. Para R$ 1.500,00 digite 1500.00. O sistema usa o formato americano nos inputs numericos.',
      },
      {
        pergunta: 'Qual a diferenca entre Custo e Preco de Venda?',
        resposta: 'Custo e quanto voce paga pelo produto (compra do fornecedor). Preco de Venda e quanto voce cobra do cliente. A diferenca e seu lucro. O sistema calcula automaticamente a margem de lucro.',
      },
      {
        pergunta: 'Como editar um produto?',
        resposta: 'Na lista de produtos (/produtos), clique no NOME do produto para ir direto a edicao. Ou clique no menu de tres pontos e selecione "Editar".',
      },
      {
        pergunta: 'O que e o codigo do produto?',
        resposta: 'E um identificador unico para busca rapida. Pode ser o codigo de barras ou um codigo interno. Use o botao "Gerar" para criar um automaticamente.',
      },
      {
        pergunta: 'Como desativar um produto sem excluir?',
        resposta: 'Na edicao do produto, clique no botao "Ativo" para mudar para "Inativo". Produtos inativos nao aparecem no PDV mas continuam no historico.',
      },
    ],
    guias: [
      {
        titulo: 'Cadastrar um novo produto',
        passos: [
          'Acesse Produtos > Novo Produto',
          'Preencha o nome e selecione a categoria',
          'Informe o Custo usando ponto decimal (ex: 50.00)',
          'Informe o Preco de Venda (ex: 89.90)',
          'Defina o estoque inicial e minimo',
          'Clique em Salvar',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Margem de lucro saudavel',
        descricao: 'O sistema indica margem em cores: verde (>50%), azul (30-50%), laranja (<30%). Margens abaixo de 30% podem nao cobrir custos operacionais.',
      },
    ],
  },
  {
    id: 'estoque',
    titulo: 'Estoque',
    icon: Warehouse,
    faqs: [
      {
        pergunta: 'Qual a diferenca entre Entrada, Saida e Definir Estoque?',
        resposta: 'ENTRADA: soma a quantidade ao estoque atual (ex: recebeu mercadoria). SAIDA: subtrai do estoque (ex: perda, avaria). DEFINIR ESTOQUE: substitui o valor atual pelo novo (ex: correcao apos inventario).',
      },
      {
        pergunta: 'Por que meu estoque somou em vez de definir o valor?',
        resposta: 'Se voce usou "Entrada de Estoque", ele soma ao atual. Para CORRIGIR o estoque para um valor exato, use "Definir Estoque" (icone de refresh). Isso substitui o valor ao inves de somar.',
      },
      {
        pergunta: 'O que e Estoque Baixo?',
        resposta: 'Quando o estoque atual e MENOR OU IGUAL ao estoque minimo configurado no produto. Exemplo: minimo 5, atual 5 = estoque baixo. Configure o minimo de cada produto para receber alertas.',
      },
      {
        pergunta: 'Como corrigir o estoque apos inventario?',
        resposta: 'Use a opcao "Definir Estoque" na pagina de Estoque. Selecione o produto, escolha "Definir Estoque" e informe a quantidade real encontrada. Adicione uma observacao como "Correcao de inventario".',
      },
      {
        pergunta: 'O estoque baixa automaticamente nas vendas?',
        resposta: 'Sim! Ao finalizar uma venda no PDV, o estoque dos produtos vendidos e automaticamente decrementado.',
      },
      {
        pergunta: 'O estoque baixa automaticamente nas OS?',
        resposta: 'Sim, ao adicionar produtos em uma Ordem de Servico, o estoque e automaticamente decrementado.',
      },
    ],
    guias: [
      {
        titulo: 'Fazer correcao de inventario',
        passos: [
          'Acesse a pagina Estoque',
          'Localize o produto a corrigir',
          'Clique em "Definir Estoque" (icone de refresh)',
          'Informe a quantidade REAL em estoque',
          'Adicione observacao: "Correcao de inventario"',
          'Confirme a operacao',
        ],
      },
      {
        titulo: 'Registrar entrada de mercadoria',
        passos: [
          'Acesse a pagina Estoque',
          'Localize o produto',
          'Clique em "Entrada de Estoque"',
          'Informe a quantidade recebida',
          'Adicione o numero da nota fiscal na observacao',
          'Confirme a operacao',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Valor em Estoque',
        descricao: 'O "Valor em Estoque" e calculado como: Custo x Quantidade. Se o valor parece errado, verifique se o custo do produto esta correto.',
      },
    ],
  },
  {
    id: 'vendas',
    titulo: 'Vendas (PDV)',
    icon: ShoppingCart,
    faqs: [
      {
        pergunta: 'Como fazer uma venda rapida?',
        resposta: 'No PDV, busque o produto pelo nome ou codigo, clique para adicionar ao carrinho, ajuste quantidade se necessario, selecione forma de pagamento e finalize.',
      },
      {
        pergunta: 'Como aplicar desconto?',
        resposta: 'No carrinho, voce pode aplicar desconto por item ou no total. Clique no valor e informe o desconto em reais ou percentual.',
      },
      {
        pergunta: 'Quais sao os atalhos do PDV?',
        resposta: 'F2: Buscar produto. F4: Finalizar venda. F8: Cancelar venda. Esc: Limpar busca. Use os atalhos para agilizar o atendimento.',
      },
      {
        pergunta: 'Como cancelar uma venda ja finalizada?',
        resposta: 'Na lista de vendas, localize a venda, clique no menu e selecione "Estornar". O estoque sera automaticamente devolvido.',
      },
      {
        pergunta: 'Como vincular um cliente a venda?',
        resposta: 'No PDV, clique em "Selecionar Cliente" antes de finalizar. Isso permite emitir nota com CPF e manter historico de compras.',
      },
    ],
    guias: [
      {
        titulo: 'Realizar uma venda completa',
        passos: [
          'Acesse Vendas (PDV)',
          'Busque e adicione os produtos (F2 para buscar)',
          'Ajuste quantidades se necessario',
          'Selecione o cliente (opcional)',
          'Aplique desconto se necessario',
          'Escolha forma de pagamento',
          'Finalize a venda (F4)',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Atalhos economizam tempo',
        descricao: 'Memorize F2 (buscar) e F4 (finalizar). Com pratica, voce faz uma venda em segundos sem usar o mouse.',
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
        resposta: 'O controle de caixa permite acompanhar entradas e saidas de dinheiro, fazer fechamento diario e identificar divergencias. E essencial para controle financeiro.',
      },
      {
        pergunta: 'O que e Sangria?',
        resposta: 'Sangria e a retirada de dinheiro do caixa (ex: para deposito bancario, pagamento de fornecedor). Registre sempre para manter o controle.',
      },
      {
        pergunta: 'O que e Suprimento?',
        resposta: 'Suprimento e a entrada de dinheiro no caixa que nao vem de vendas (ex: troco inicial, reforco de caixa).',
      },
      {
        pergunta: 'O que fazer se o caixa nao fechar?',
        resposta: 'Verifique: 1) Todas as vendas em dinheiro foram registradas? 2) Sangrias e suprimentos estao corretos? 3) Houve troco errado? Registre a diferenca como ajuste.',
      },
    ],
    guias: [
      {
        titulo: 'Rotina diaria de caixa',
        passos: [
          'Abra o caixa informando o valor inicial (troco)',
          'Realize as vendas normalmente',
          'Registre sangrias quando retirar dinheiro',
          'No fim do dia, conte o dinheiro fisico',
          'Feche o caixa informando valor em especie',
          'Analise o relatorio de fechamento',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Confira o caixa periodicamente',
        descricao: 'Nao espere o fim do dia para conferir. Uma conferencia rapida apos o almoco ajuda a identificar problemas cedo.',
      },
    ],
  },
  {
    id: 'ordens-servico',
    titulo: 'Ordens de Servico',
    icon: FileText,
    faqs: [
      {
        pergunta: 'Como criar uma ordem de servico?',
        resposta: 'Acesse Ordens de Servico > Nova OS. Selecione o cliente, descreva o problema/servico, adicione produtos e servicos, defina prazo e salve.',
      },
      {
        pergunta: 'Quais sao os status de uma OS?',
        resposta: 'Aberta (aguardando inicio), Em Andamento (sendo executada), Aguardando Pecas, Aguardando Aprovacao, Pronta (finalizada), Entregue (cliente retirou), Cancelada.',
      },
      {
        pergunta: 'Como adicionar produtos a uma OS?',
        resposta: 'Na edicao da OS, va na aba "Produtos/Servicos", busque o produto e adicione. O estoque sera decrementado automaticamente.',
      },
      {
        pergunta: 'Como imprimir a OS?',
        resposta: 'Na visualizacao da OS, clique em "Imprimir". O documento inclui dados do cliente, itens, valores e termos de garantia.',
      },
    ],
    guias: [
      {
        titulo: 'Fluxo completo de uma OS',
        passos: [
          'Crie a OS com dados do cliente e descricao',
          'Mude para "Em Andamento" ao iniciar',
          'Adicione produtos/servicos utilizados',
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
        descricao: 'Defina prazos com margem de seguranca. E melhor entregar antes do prazo do que atrasar.',
      },
    ],
  },
  {
    id: 'configuracoes',
    titulo: 'Configuracoes',
    icon: Settings,
    faqs: [
      {
        pergunta: 'Como alterar a logo da empresa?',
        resposta: 'Em Configuracoes > Dados da Empresa, clique na area da logo para fazer upload. Use uma imagem quadrada para melhor resultado.',
      },
      {
        pergunta: 'Como configurar a impressora?',
        resposta: 'Em Configuracoes > Impressao, selecione o modelo de impressora termica. O sistema suporta impressoras de 58mm e 80mm.',
      },
      {
        pergunta: 'Como alterar minha senha?',
        resposta: 'Clique no seu nome no canto superior direito > Minha Conta > Alterar Senha.',
      },
      {
        pergunta: 'Como sair do sistema?',
        resposta: 'Clique no seu nome no canto superior direito e depois em "Sair". Isso encerra sua sessao com seguranca.',
      },
    ],
    guias: [
      {
        titulo: 'Personalizar o sistema',
        passos: [
          'Acesse Configuracoes',
          'Adicione a logo da sua empresa',
          'Defina a cor primaria da marca',
          'Configure os dados fiscais (CNPJ)',
          'Preencha endereco completo',
          'Salve as alteracoes',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Backup dos dados',
        descricao: 'Seus dados sao armazenados na nuvem com backup automatico. Voce nao precisa se preocupar com perda de dados.',
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
