import {
  Rocket,
  Package,
  Warehouse,
  ShoppingCart,
  DollarSign,
  FileText,
  Settings,
  AlertTriangle,
  CreditCard,
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
      {
        pergunta: 'Como o cliente acompanha o status da OS?',
        resposta: 'Cada OS gera automaticamente um código de acompanhamento. O cliente pode escanear o QR Code no cupom impresso ou acessar o link enviado por WhatsApp. A página mostra o status em tempo real, sem precisar de login.',
      },
      {
        pergunta: 'Como enviar o link de acompanhamento para o cliente?',
        resposta: 'Na visualização da OS, clique no botão "Enviar Link" ao lado de Imprimir. Isso abre o WhatsApp com uma mensagem pronta contendo o link de acompanhamento. Você também pode copiar o link clicando no ícone de compartilhamento.',
      },
      {
        pergunta: 'O QR Code aparece no cupom automaticamente?',
        resposta: 'Sim! Ao imprimir qualquer tipo de comprovante (entrada, completa ou entrega), o QR Code de acompanhamento aparece automaticamente no rodapé. Funciona em impressoras térmicas (58mm e 80mm) e em A4.',
      },
      {
        pergunta: 'O cliente precisa criar conta para acompanhar?',
        resposta: 'Não. A página de acompanhamento é pública e não exige login. O cliente só precisa do link ou escanear o QR Code.',
      },
    ],
    guias: [
      {
        titulo: 'Fluxo completo de uma OS',
        passos: [
          'Crie a OS com dados do cliente e descrição',
          'Imprima o comprovante de entrada (já vem com QR Code)',
          'Mude para "Em Andamento" ao iniciar',
          'Adicione produtos/serviços utilizados',
          'Mude para "Pronta" ao finalizar',
          'Clique em "Enviar Link" para notificar o cliente via WhatsApp',
          'Receba o pagamento',
          'Mude para "Entregue" na retirada',
        ],
      },
      {
        titulo: 'Enviar link de acompanhamento ao cliente',
        passos: [
          'Abra a OS desejada',
          'Clique no botão "Enviar Link" (ícone do WhatsApp)',
          'O WhatsApp abre com mensagem pronta e link',
          'Envie a mensagem para o cliente',
          'O cliente clica no link e vê o status em tempo real',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Prazos realistas',
        descricao: 'Defina prazos com margem de segurança. É melhor entregar antes do prazo do que atrasar.',
      },
      {
        titulo: 'Acompanhamento reduz ligações',
        descricao: 'Envie o link de acompanhamento ao cliente logo na entrada. Isso reduz ligações perguntando "meu celular já ficou pronto?" — o cliente consulta sozinho.',
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
  {
    id: 'problemas',
    titulo: 'Problemas e Soluções',
    icon: AlertTriangle,
    faqs: [
      {
        pergunta: 'Erro "O telefone informado é inválido" no pagamento',
        resposta: 'O gateway de pagamento exige um telefone real com DDD. Acesse Configurações > Dados da Empresa e atualize o campo Telefone com um número válido de 10 ou 11 dígitos (ex: 11987654321). Números fictícios como 99999-9999 são rejeitados.',
      },
      {
        pergunta: 'Erro "CPF ou CNPJ inválido" no pagamento',
        resposta: 'O documento informado não passou na validação. Acesse Configurações > Dados da Empresa e verifique se o CPF (11 dígitos) ou CNPJ (14 dígitos) está correto. Certifique-se de que não há números a mais ou a menos.',
      },
      {
        pergunta: 'Erro "Você já possui uma assinatura ativa"',
        resposta: 'Sua empresa já tem um plano pago ativo. Para trocar de plano, cancele a assinatura atual em Meu Plano antes de assinar um novo. Se achar que é um erro, entre em contato com o suporte.',
      },
      {
        pergunta: 'Erro "Você já possui um pagamento pendente"',
        resposta: 'Existe um pagamento aguardando confirmação (PIX ou Boleto). Aguarde a confirmação (pode levar até 3 dias úteis para boleto) ou acesse Meu Plano para cancelar e tentar novamente.',
      },
      {
        pergunta: 'O pagamento foi aprovado mas o plano não ativou',
        resposta: 'Aguarde alguns segundos e atualize a página. Se persistir, faça logout e login novamente. O sistema processa os pagamentos automaticamente via webhook.',
      },
      {
        pergunta: 'Erro ao criar Ordem de Serviço',
        resposta: 'Verifique se: 1) Você selecionou um cliente, 2) O aparelho foi informado, 3) O problema foi descrito. Se o erro persistir, atualize a página e tente novamente.',
      },
      {
        pergunta: 'Meu estoque ficou negativo',
        resposta: 'Isso acontece quando há mais saídas do que entradas registradas. Use "Definir Estoque" para corrigir com a quantidade real após um inventário físico.',
      },
      {
        pergunta: 'O valor está sendo salvo errado (ex: 350 em vez de 3.50)',
        resposta: 'Use PONTO como separador decimal, não vírgula. Para R$ 3,50 digite 3.50. Para R$ 1.500,00 digite 1500.00. O sistema usa formato americano nos campos numéricos.',
      },
      {
        pergunta: 'Sessão expirada / "Não autenticado"',
        resposta: 'Sua sessão expirou por segurança. Faça login novamente. Isso acontece após um período de inatividade ou quando você acessa de outro dispositivo.',
      },
      {
        pergunta: 'A página não carrega ou fica em branco',
        resposta: 'Tente: 1) Atualizar a página (F5), 2) Limpar cache do navegador (Ctrl+Shift+Del), 3) Tentar outro navegador (Chrome recomendado), 4) Verificar sua conexão com internet.',
      },
      {
        pergunta: 'Erro "Limite do plano atingido"',
        resposta: 'Você atingiu o limite do seu plano atual (produtos, vendas ou OS). Faça upgrade para um plano superior em Meu Plano para continuar usando o sistema sem restrições.',
      },
      {
        pergunta: 'Não consigo excluir um produto/cliente',
        resposta: 'Itens vinculados a vendas ou OS não podem ser excluídos para manter o histórico. Use a opção "Inativar" em vez de excluir. Itens inativos não aparecem nas buscas mas ficam no histórico.',
      },
    ],
    guias: [
      {
        titulo: 'Corrigir dados para pagamento',
        passos: [
          'Acesse Configurações no menu lateral',
          'Verifique se o Telefone tem 10-11 dígitos com DDD',
          'Verifique se o CPF tem 11 dígitos ou CNPJ tem 14',
          'Verifique se o E-mail está correto',
          'Salve as alterações',
          'Tente o pagamento novamente em Meu Plano',
        ],
      },
      {
        titulo: 'Resolver problemas de carregamento',
        passos: [
          'Pressione F5 para atualizar a página',
          'Se não resolver, pressione Ctrl+Shift+Del',
          'Marque "Cache" e clique em Limpar',
          'Feche e abra o navegador novamente',
          'Se persistir, tente no modo anônimo (Ctrl+Shift+N)',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Dados da empresa são essenciais',
        descricao: 'Mantenha os dados da empresa atualizados em Configurações. Telefone e documento válidos são obrigatórios para processar pagamentos.',
      },
      {
        titulo: 'Use o navegador recomendado',
        descricao: 'O CellFlow funciona melhor no Google Chrome ou Microsoft Edge atualizados. Evite navegadores desatualizados ou com muitas extensões.',
      },
    ],
  },
  {
    id: 'pagamentos',
    titulo: 'Pagamentos e Planos',
    icon: CreditCard,
    faqs: [
      {
        pergunta: 'Quais formas de pagamento são aceitas?',
        resposta: 'PIX (confirmação instantânea), Cartão de Crédito (confirmação imediata) e Boleto Bancário (até 3 dias úteis para compensar).',
      },
      {
        pergunta: 'O PIX é confirmado na hora?',
        resposta: 'Sim! O PIX tem confirmação automática em segundos. Após pagar, aguarde a tela atualizar ou atualize manualmente.',
      },
      {
        pergunta: 'Por que o cartão pede tantos dados?',
        resposta: 'Por segurança antifraude. O gateway valida: CPF do titular, CEP, telefone e e-mail. Isso protege você e seu cartão contra uso indevido.',
      },
      {
        pergunta: 'Posso parcelar o plano anual?',
        resposta: 'Sim, o plano anual pode ser parcelado em até 12x no cartão de crédito. O valor à vista tem desconto em relação ao mensal.',
      },
      {
        pergunta: 'Como cancelar minha assinatura?',
        resposta: 'Acesse Meu Plano e clique em "Cancelar Assinatura". O acesso continua até o fim do período pago. Não há reembolso proporcional.',
      },
      {
        pergunta: 'O que acontece se eu não pagar?',
        resposta: 'Após o vencimento, você tem 7 dias de tolerância. Depois, o acesso é suspenso mas seus dados ficam guardados por 90 dias. Regularize para reativar.',
      },
      {
        pergunta: 'Como alterar a forma de pagamento?',
        resposta: 'Cancele a assinatura atual e faça uma nova assinatura escolhendo a nova forma de pagamento desejada.',
      },
      {
        pergunta: 'Recebi cobrança duplicada, o que fazer?',
        resposta: 'Isso não deveria acontecer (o sistema bloqueia). Mas se ocorreu, entre em contato imediatamente pelo suporte que faremos o estorno.',
      },
    ],
    guias: [
      {
        titulo: 'Assinar um plano passo a passo',
        passos: [
          'Acesse "Meu Plano" no menu lateral',
          'Escolha entre Mensal ou Anual',
          'Selecione a forma de pagamento (PIX, Cartão ou Boleto)',
          'Para cartão: preencha todos os dados solicitados',
          'Confirme o pagamento',
          'Aguarde a confirmação (PIX/Cartão: segundos, Boleto: até 3 dias)',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'PIX é mais rápido',
        descricao: 'Se precisa liberar o plano imediatamente, use PIX. A confirmação é automática em segundos após o pagamento.',
      },
      {
        titulo: 'Plano Anual economiza',
        descricao: 'O plano anual tem desconto significativo em relação a 12 meses do plano mensal. Ideal para quem já validou o sistema.',
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
