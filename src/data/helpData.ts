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
  LayoutDashboard,
  Users,
  Wrench,
  BarChart3,
  Gift,
  ScrollText,
  User,
  Store,
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
        resposta: 'Acesse Configurações > aba Empresa. Lá você pode adicionar nome, CNPJ, endereço, telefone, WhatsApp e logo. Essas informações aparecerão nos cupons e documentos gerados.',
      },
      {
        pergunta: 'Como criar usuários para minha equipe?',
        resposta: 'Em Configurações > aba Usuários, clique em "Novo Usuário". Defina nome, email, senha e o perfil (Administrador ou Funcionário). Cada perfil tem permissões diferentes.',
      },
      {
        pergunta: 'Qual a diferença entre os perfis de usuário?',
        resposta: 'Administrador: acesso total ao sistema, incluindo configurações, relatórios, logs e exclusão de registros. Funcionário: acesso a vendas, ordens de serviço, clientes e estoque, mas sem acesso a configurações, relatórios financeiros e logs.',
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
    id: 'dashboard',
    titulo: 'Painel',
    icon: LayoutDashboard,
    faqs: [
      {
        pergunta: 'O que mostra o Painel?',
        resposta: 'O Painel mostra o resumo do dia: faturamento, custos, lucro líquido, ordens de serviço abertas, alerta de estoque baixo, aniversariantes do dia, gráfico de vendas da semana, últimas vendas e últimas ordens de serviço.',
      },
      {
        pergunta: 'Posso cancelar uma venda pelo Painel?',
        resposta: 'Sim. Na seção "Últimas Vendas", clique no menu (três pontos) ao lado da venda e selecione "Cancelar venda". Informe o motivo do cancelamento. O estoque dos produtos será restaurado automaticamente.',
      },
      {
        pergunta: 'Posso mudar o status de uma ordem de serviço pelo Painel?',
        resposta: 'Sim. Na seção "Ordens de Serviço", clique no badge de status da ordem de serviço. Um menu aparece com os status disponíveis para transição. Isso permite atualizar o status rapidamente sem abrir a ordem de serviço.',
      },
      {
        pergunta: 'O que significa o alerta de estoque?',
        resposta: 'O alerta amarelo aparece quando há produtos com estoque abaixo do mínimo configurado. Clique em "Ver produtos" para ir direto à lista de produtos com estoque baixo.',
      },
    ],
    guias: [
      {
        titulo: 'Usar o Painel no dia a dia',
        passos: [
          'Confira o faturamento e lucro do dia nos cards principais',
          'Verifique se há alertas de estoque baixo',
          'Veja aniversariantes para enviar mensagens de felicitação',
          'Use os botões rápidos (Nova Venda, Nova Ordem de Serviço, Caixa)',
          'Acompanhe as últimas vendas e ordens de serviço na parte inferior',
          'Analise o gráfico de faturamento semanal para tendências',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Atalhos rápidos',
        descricao: 'Use os botões "Nova Venda", "Nova Ordem de Serviço" e "Caixa" no topo do Painel para acessar as funções mais usadas sem navegar pelo menu.',
      },
    ],
  },
  {
    id: 'clientes',
    titulo: 'Clientes',
    icon: Users,
    faqs: [
      {
        pergunta: 'Como cadastrar um cliente?',
        resposta: 'Acesse Clientes e clique em "Novo Cliente". Preencha nome (obrigatório), telefone, email, CPF, data de nascimento, endereço e cidade. Clique em Salvar.',
      },
      {
        pergunta: 'Como buscar um cliente?',
        resposta: 'Na página de Clientes, use o campo de busca para pesquisar por nome, telefone, CPF ou email. A busca é feita automaticamente conforme você digita.',
      },
      {
        pergunta: 'Como exportar a lista de clientes?',
        resposta: 'Na página de Clientes, clique no botão "Exportar". Um arquivo CSV será gerado com nome, telefone, email, CPF, data de nascimento, endereço e cidade de todos os clientes.',
      },
      {
        pergunta: 'Como ver os aniversariantes da semana?',
        resposta: 'Na página de Clientes, um card especial mostra os aniversariantes dos próximos 7 dias. Clientes com aniversário no dia atual ganham um badge "Aniversário!" na tabela.',
      },
      {
        pergunta: 'Por que não consigo excluir um cliente?',
        resposta: 'A exclusão de clientes é restrita ao perfil Administrador. Além disso, clientes vinculados a vendas ou ordens de serviço não podem ser excluídos para manter o histórico.',
      },
    ],
    guias: [
      {
        titulo: 'Cadastrar e gerenciar clientes',
        passos: [
          'Acesse Clientes no menu lateral',
          'Clique em "Novo Cliente"',
          'Preencha os dados (nome é obrigatório)',
          'Informe a data de nascimento para receber alertas de aniversário',
          'Salve o cadastro',
          'Use a busca para encontrar clientes rapidamente',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Cadastre a data de nascimento',
        descricao: 'Clientes com data de nascimento cadastrada aparecem nos alertas de aniversário do Painel e da página de Clientes. Use isso para enviar mensagens de felicitação e fidelizar.',
      },
      {
        titulo: 'Exporte antes de limpar',
        descricao: 'Antes de qualquer limpeza no cadastro, use o botão "Exportar" para gerar um backup em CSV dos seus clientes.',
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
      {
        pergunta: 'Como adicionar uma foto ao produto?',
        resposta: 'Ao criar ou editar um produto, há a seção "Imagem do Produto". Clique na área tracejada para selecionar uma foto (JPEG, PNG ou WebP, até 20MB). A imagem é comprimida automaticamente para otimizar o carregamento.',
      },
      {
        pergunta: 'O que é o toggle "Exibir no Catálogo"?',
        resposta: 'É a opção que controla se o produto aparece na vitrine digital pública da sua loja. Ative-o para que o produto fique visível no catálogo online que seus clientes podem acessar.',
      },
      {
        pergunta: 'O que significa o badge roxo "Catálogo" na lista de produtos?',
        resposta: 'Indica que o produto está habilitado para aparecer no catálogo digital público. Produtos com esse badge são visíveis para qualquer pessoa que acesse o link do seu catálogo.',
      },
    ],
    guias: [
      {
        titulo: 'Cadastrar um novo produto',
        passos: [
          'Acesse Produtos > Novo Produto',
          'Preencha o nome e selecione a categoria',
          'Adicione uma foto do produto (opcional, mas recomendado para o catálogo)',
          'Ative "Exibir no Catálogo" se quiser que o produto apareça na vitrine digital',
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
      {
        titulo: 'Use o leitor de código de barras',
        descricao: 'No PDV, você pode usar um leitor de código de barras. Ao escanear, se o código corresponder a um produto cadastrado, ele é adicionado automaticamente ao carrinho.',
      },
      {
        titulo: 'Fotos vendem mais',
        descricao: 'Produtos com foto no catálogo digital chamam muito mais atenção. Tire fotos de qualidade com fundo limpo para melhorar as vendas pela vitrine.',
      },
    ],
  },
  {
    id: 'servicos',
    titulo: 'Serviços',
    icon: Wrench,
    faqs: [
      {
        pergunta: 'Como cadastrar um serviço?',
        resposta: 'Acesse Serviços e clique em "Novo Serviço". Preencha nome, descrição, tipo (Básico ou Avançado), tempo estimado e preço base. Clique em Salvar.',
      },
      {
        pergunta: 'Qual a diferença entre serviço Básico e Avançado?',
        resposta: 'É uma classificação organizacional. Serviços Básicos são reparos simples (troca de tela, bateria). Avançados são reparos complexos (reparo de placa, micro soldagem). Use para organizar e filtrar.',
      },
      {
        pergunta: 'Como desativar um serviço?',
        resposta: 'Na lista de serviços, clique no menu de três pontos e selecione "Desativar". Serviços inativos ficam esmaecidos na lista e não aparecem nas opções ao criar uma ordem de serviço.',
      },
      {
        pergunta: 'Para que serve o tempo estimado?',
        resposta: 'O tempo estimado ajuda a calcular previsões de entrega ao criar ordens de serviço. Informe em minutos — o sistema formata automaticamente (ex: 90 min = 1h 30min).',
      },
    ],
    guias: [
      {
        titulo: 'Cadastrar serviços da loja',
        passos: [
          'Acesse Serviços no menu lateral',
          'Clique em "Novo Serviço"',
          'Preencha o nome do serviço (ex: Troca de Tela)',
          'Selecione o tipo: Básico ou Avançado',
          'Informe o tempo estimado em minutos',
          'Defina o preço base',
          'Salve o serviço',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Preço base é referência',
        descricao: 'O preço base do serviço é uma referência. Ao adicionar o serviço em uma ordem de serviço, você pode ajustar o valor conforme o caso específico.',
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
        pergunta: 'O estoque baixa automaticamente nas ordens de serviço?',
        resposta: 'Sim, ao adicionar produtos em uma ordem de serviço, o estoque é automaticamente decrementado.',
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
        resposta: 'No painel de resumo (lado direito no desktop, botão "Resumo" no mobile), há um campo "Desconto" em R$. Informe o valor do desconto no total da venda.',
      },
      {
        pergunta: 'Quais são os atalhos do PDV?',
        resposta: 'F2: Focar na busca de produtos. F4: Finalizar venda. Esc: Limpar campo de busca. Use os atalhos para agilizar o atendimento.',
      },
      {
        pergunta: 'Como cancelar uma venda já finalizada?',
        resposta: 'No Painel, na seção "Últimas Vendas", clique no menu (três pontos) ao lado da venda e selecione "Cancelar venda". Informe o motivo — o estoque é restaurado automaticamente.',
      },
      {
        pergunta: 'Como vincular um cliente à venda?',
        resposta: 'No painel de resumo, clique em "Selecionar" na seção Cliente. Busque o cliente por nome ou telefone e selecione. O vínculo é opcional — sem cliente, a venda é registrada como "Cliente Avulso".',
      },
      {
        pergunta: 'Como usar o leitor de código de barras?',
        resposta: 'Com o cursor no campo de busca (F2), escaneie o código de barras. Se o código corresponder a um produto cadastrado com estoque, ele é adicionado automaticamente ao carrinho.',
      },
      {
        pergunta: 'Preciso abrir o caixa antes de vender?',
        resposta: 'Não é obrigatório, mas recomendado. Se o caixa não estiver aberto, um aviso aparece ao finalizar. A venda é registrada, porém não será contabilizada no controle de caixa.',
      },
      {
        pergunta: 'O que são as formas de pagamento disponíveis?',
        resposta: 'Dinheiro (com calculadora de troco), PIX, Débito e Crédito. Ao selecionar Dinheiro, informe o valor recebido para calcular o troco automaticamente.',
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
          'Aplique desconto em R$ se necessário',
          'Escolha forma de pagamento',
          'Finalize a venda (F4)',
          'Imprima o cupom ou inicie nova venda',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Atalhos economizam tempo',
        descricao: 'Memorize F2 (buscar) e F4 (finalizar). Com prática, você faz uma venda em segundos sem usar o mouse.',
      },
      {
        titulo: 'Estoque é validado em tempo real',
        descricao: 'O PDV impede adicionar produtos sem estoque e limita a quantidade ao estoque disponível. Se aparecer "Quantidade máxima atingida", verifique o estoque do produto.',
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
        resposta: 'Acesse Ordens de Serviço > Nova Ordem de Serviço. Selecione o cliente, informe os dados do aparelho (marca, modelo, cor, IMEI), descreva o problema, adicione produtos e serviços, defina prazo e salve.',
      },
      {
        pergunta: 'Quais são os status de uma ordem de serviço?',
        resposta: 'Aberta (recebido), Em Análise (técnico analisando), Aguardando Peça, Aguardando Aprovação (orçamento enviado), Em Andamento (reparo em execução), Finalizada (serviço concluído), Entregue (cliente retirou), Cancelada.',
      },
      {
        pergunta: 'Como adicionar produtos a uma ordem de serviço?',
        resposta: 'Na edição da ordem de serviço, vá na aba "Produtos/Serviços", busque o produto e adicione. O estoque será decrementado automaticamente.',
      },
      {
        pergunta: 'Como imprimir a ordem de serviço?',
        resposta: 'Na visualização da ordem de serviço, clique em "Imprimir". O documento inclui dados do cliente, itens, valores, termos de garantia e um QR Code para acompanhamento.',
      },
      {
        pergunta: 'Como o cliente acompanha o status da ordem de serviço?',
        resposta: 'Cada ordem de serviço gera automaticamente um código de acompanhamento. O cliente pode escanear o QR Code no cupom impresso ou acessar o link enviado por WhatsApp. A página mostra o status em tempo real, sem precisar de login.',
      },
      {
        pergunta: 'Como enviar o link de acompanhamento para o cliente?',
        resposta: 'Na visualização da ordem de serviço, clique no botão "Enviar Link" ao lado de Imprimir. Isso abre o WhatsApp com uma mensagem pronta contendo o link de acompanhamento. Você também pode copiar o link clicando no ícone de compartilhamento.',
      },
      {
        pergunta: 'O QR Code aparece no cupom automaticamente?',
        resposta: 'Sim! Ao imprimir qualquer tipo de comprovante (entrada, completa ou entrega), o QR Code de acompanhamento aparece automaticamente no rodapé. Funciona em impressoras térmicas (58mm e 80mm) e em A4.',
      },
      {
        pergunta: 'O cliente precisa criar conta para acompanhar?',
        resposta: 'Não. A página de acompanhamento é pública e não exige login. O cliente só precisa do link ou escanear o QR Code.',
      },
      {
        pergunta: 'Como filtrar ordens de serviço por status?',
        resposta: 'Na lista de ordens de serviço, use o seletor de status ao lado da busca. Você pode filtrar por qualquer status: Aberta, Em Análise, Aguardando Peça, Aguardando Aprovação, Em Andamento, Finalizada, Entregue ou Cancelada.',
      },
    ],
    guias: [
      {
        titulo: 'Fluxo completo de uma ordem de serviço',
        passos: [
          'Crie a ordem de serviço com dados do cliente e descrição',
          'Imprima o comprovante de entrada (já vem com QR Code)',
          'Mude para "Em Análise" ao iniciar diagnóstico',
          'Adicione produtos/serviços utilizados',
          'Mude para "Finalizada" ao concluir o reparo',
          'Clique em "Enviar Link" para notificar o cliente via WhatsApp',
          'Receba o pagamento',
          'Mude para "Entregue" na retirada',
        ],
      },
      {
        titulo: 'Enviar link de acompanhamento ao cliente',
        passos: [
          'Abra a ordem de serviço desejada',
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
    id: 'catalogo',
    titulo: 'Catálogo Digital',
    icon: Store,
    faqs: [
      {
        pergunta: 'O que é o Catálogo Digital?',
        resposta: 'É uma vitrine online pública da sua loja. Seus clientes podem ver os produtos disponíveis, preços e entrar em contato pelo WhatsApp demonstrando interesse — tudo sem precisar de login.',
      },
      {
        pergunta: 'Como ativar o catálogo da minha loja?',
        resposta: 'Basta habilitar produtos para o catálogo! Ao criar ou editar um produto, ative o toggle "Exibir no Catálogo" e adicione uma foto. Produtos ativos, com estoque e com o catálogo habilitado aparecem automaticamente na vitrine.',
      },
      {
        pergunta: 'Qual é o link do meu catálogo?',
        resposta: 'O link do catálogo segue o padrão: cellflow.com.br/catalogo/[id-da-sua-empresa]. Esse link é público e pode ser compartilhado por WhatsApp, redes sociais, cartão de visita ou QR Code.',
      },
      {
        pergunta: 'O cliente precisa ter conta para ver o catálogo?',
        resposta: 'Não. O catálogo é totalmente público. Qualquer pessoa com o link pode visualizar os produtos sem precisar de cadastro ou login.',
      },
      {
        pergunta: 'Como funciona o botão "Tenho Interesse"?',
        resposta: 'Ao clicar em "Tenho Interesse" em um produto, o WhatsApp da loja é aberto com uma mensagem pronta: "Olá, vi o [produto] (R$ XX,XX) no catálogo e tenho interesse!". Isso facilita o contato e a conversão.',
      },
      {
        pergunta: 'O preço de custo aparece no catálogo?',
        resposta: 'Não! O catálogo mostra apenas o nome, descrição, foto e preço de venda. O custo e a margem de lucro ficam visíveis apenas para você no painel administrativo.',
      },
      {
        pergunta: 'Produtos sem estoque aparecem no catálogo?',
        resposta: 'Não. Apenas produtos ativos, com estoque maior que zero e com "Exibir no Catálogo" habilitado aparecem na vitrine. Se o estoque zerar, o produto some automaticamente.',
      },
      {
        pergunta: 'O catálogo aparece na página de acompanhamento da ordem de serviço?',
        resposta: 'Sim! Quando o cliente acessa o link de acompanhamento da ordem de serviço, uma seção "Confira nossos produtos" mostra até 4 produtos do seu catálogo com um link para ver o catálogo completo.',
      },
      {
        pergunta: 'O catálogo usa as cores da minha loja?',
        resposta: 'Sim. O catálogo usa a cor primária configurada na sua empresa para botões de categoria e destaques de preço, mantendo a identidade visual da sua marca.',
      },
      {
        pergunta: 'Como configurar o WhatsApp para o catálogo?',
        resposta: 'O número do WhatsApp usado no catálogo é o mesmo cadastrado em Configurações > Empresa > WhatsApp. Certifique-se de que está preenchido corretamente com DDD para que o botão "Tenho Interesse" funcione.',
      },
    ],
    guias: [
      {
        titulo: 'Montar seu catálogo digital',
        passos: [
          'Acesse Produtos e edite os itens que deseja exibir',
          'Adicione uma foto de qualidade para cada produto',
          'Ative o toggle "Exibir no Catálogo"',
          'Verifique se o WhatsApp da empresa está configurado (Configurações > Empresa)',
          'Acesse o link do catálogo para conferir como ficou',
          'Compartilhe o link com seus clientes',
        ],
      },
      {
        titulo: 'Divulgar o catálogo',
        passos: [
          'Copie o link do catálogo (cellflow.com.br/catalogo/seu-id)',
          'Envie por WhatsApp para seus contatos e grupos',
          'Adicione o link na bio do Instagram da loja',
          'Gere um QR Code do link e coloque no balcão',
          'Imprima o QR Code em cartões de visita ou panfletos',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Clientes da ordem de serviço veem seu catálogo',
        descricao: 'Toda vez que um cliente acompanha a ordem de serviço pelo link, ele vê uma seção de produtos da sua loja. É uma oportunidade gratuita de venda adicional.',
      },
      {
        titulo: 'Fotos fazem a diferença',
        descricao: 'Produtos com fotos de qualidade vendem muito mais. Use fundo branco ou neutro, boa iluminação e mostre o produto de frente.',
      },
      {
        titulo: 'Mantenha o estoque atualizado',
        descricao: 'Produtos sem estoque somem automaticamente do catálogo. Mantenha o estoque em dia para não perder oportunidades de venda.',
      },
      {
        titulo: 'WhatsApp é obrigatório',
        descricao: 'Sem o número de WhatsApp configurado, o botão "Tenho Interesse" não aparece. Configure em Configurações > Empresa.',
      },
    ],
  },
  {
    id: 'relatorios',
    titulo: 'Relatórios',
    icon: BarChart3,
    faqs: [
      {
        pergunta: 'Quais relatórios estão disponíveis?',
        resposta: 'O sistema oferece 5 abas de relatórios: Vendas (faturamento, custo e lucro por período), Ordens de Serviço (quantidade e valor por status), Produtos (ranking dos mais vendidos), Serviços (ranking dos mais realizados) e Clientes (aniversariantes).',
      },
      {
        pergunta: 'Como ver o lucro por período?',
        resposta: 'Na aba Vendas, selecione o agrupamento: Diário (últimos 7 dias), Semanal (últimos 30 dias) ou Mensal (últimos 6 meses). A tabela mostra vendas, faturamento bruto, custo, lucro líquido e margem para cada período.',
      },
      {
        pergunta: 'Como exportar um relatório?',
        resposta: 'Nas abas Vendas, Produtos e Serviços, clique no botão "Exportar CSV" no canto superior direito. Um arquivo CSV será gerado com os dados exibidos na tela.',
      },
      {
        pergunta: 'O que mostra o relatório de ordens de serviço?',
        resposta: 'A aba Ordens de Serviço mostra a quantidade e o valor total agrupadas por status (Aberta, Em Análise, Em Andamento, etc.), além do total geral e quantas estão em aberto.',
      },
      {
        pergunta: 'Quem pode ver os relatórios?',
        resposta: 'Os relatórios são restritos ao perfil Administrador. Funcionários não têm acesso à página de Relatórios.',
      },
    ],
    guias: [
      {
        titulo: 'Analisar desempenho da loja',
        passos: [
          'Acesse Relatórios no menu lateral',
          'Na aba Vendas, selecione o período desejado',
          'Analise lucro líquido e margem de cada período',
          'Vá na aba Produtos para ver os mais vendidos',
          'Vá na aba Serviços para ver os mais realizados',
          'Exporte os dados em CSV para análises externas',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Top 3 em destaque',
        descricao: 'Nas abas Produtos e Serviços, os 3 primeiros do ranking aparecem em cards de destaque com posição numerada. Use para identificar seus campeões de vendas.',
      },
      {
        titulo: 'Exporte regularmente',
        descricao: 'Exporte os relatórios em CSV mensalmente para acompanhar a evolução do negócio em planilhas externas.',
      },
    ],
  },
  {
    id: 'indicacoes',
    titulo: 'Indicações',
    icon: Gift,
    faqs: [
      {
        pergunta: 'Como funciona o programa de indicação?',
        resposta: 'Compartilhe seu link de indicação com outras lojas de celular. Quando uma loja se cadastra pelo seu link, assina um plano e permanece ativa por 30 dias, você ganha 1 mês grátis de acesso ao CellFlow. Sem limite de indicações.',
      },
      {
        pergunta: 'Como gerar meu código de indicação?',
        resposta: 'Acesse Indicações no menu lateral e clique em "Gerar Meu Código de Indicação". O código é gerado automaticamente e você pode compartilhar o link por WhatsApp ou copiar.',
      },
      {
        pergunta: 'Quando recebo o mês grátis?',
        resposta: 'Após a loja indicada se cadastrar, assinar um plano e permanecer ativa por 30 dias, a indicação é qualificada e o mês bônus é creditado automaticamente.',
      },
      {
        pergunta: 'O que significam os status da indicação?',
        resposta: 'Cadastrou: a loja se cadastrou. Pagou: assinou um plano. Qualificada: permaneceu ativa por 30 dias. Recompensada: mês bônus foi creditado. Cancelada: a loja cancelou antes da qualificação.',
      },
    ],
    guias: [
      {
        titulo: 'Indicar uma loja',
        passos: [
          'Acesse Indicações no menu lateral',
          'Gere seu código de indicação (primeira vez)',
          'Copie o link ou compartilhe pelo WhatsApp',
          'Envie para outras lojas de celular',
          'Acompanhe o status na tabela de histórico',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Compartilhe pelo WhatsApp',
        descricao: 'Use o botão "Compartilhar no WhatsApp" para enviar uma mensagem pronta com o link. É a forma mais rápida de indicar.',
      },
    ],
  },
  {
    id: 'configuracoes',
    titulo: 'Configurações',
    icon: Settings,
    faqs: [
      {
        pergunta: 'Quais abas existem em Configurações?',
        resposta: 'Configurações possui 4 abas: Empresa (dados da empresa e logo), Impressão (tipo de impressora, formato do cupom), Usuários (gerenciar equipe) e Sistema (informações e backup).',
      },
      {
        pergunta: 'Como alterar a logo da empresa?',
        resposta: 'Em Configurações > aba Empresa, clique em "Enviar Logo" (ou "Alterar Logo" se já tiver uma). Use imagem quadrada (PNG, JPG ou SVG) de até 2MB para melhor resultado.',
      },
      {
        pergunta: 'Como configurar a impressora?',
        resposta: 'Em Configurações > aba Impressão, selecione o tipo (Térmica ou Padrão A4). Para impressoras térmicas, escolha a largura (58mm ou 80mm). Configure o que mostrar no cupom: logo, endereço, telefone e mensagem personalizada.',
      },
      {
        pergunta: 'Como alterar minha senha?',
        resposta: 'Acesse Perfil no menu lateral. Na seção "Alterar Senha", informe a nova senha (mínimo 6 caracteres), confirme e clique em "Alterar Senha".',
      },
      {
        pergunta: 'Como sair do sistema?',
        resposta: 'Clique no seu nome no canto inferior do menu lateral e depois em "Sair". Isso encerra sua sessão com segurança.',
      },
      {
        pergunta: 'Como resetar a senha de um funcionário?',
        resposta: 'Em Configurações > aba Usuários, clique no ícone de chave ao lado do usuário. Um e-mail de redefinição será enviado para o e-mail cadastrado do funcionário.',
      },
      {
        pergunta: 'Como exportar backup das configurações?',
        resposta: 'Em Configurações > aba Sistema, clique em "Exportar JSON". Um arquivo com dados da empresa, impressão e usuários será baixado. Obs: este backup não inclui vendas, ordens de serviço e estoque — o backup completo deve ser feito pelo Supabase.',
      },
    ],
    guias: [
      {
        titulo: 'Configurar impressão do cupom',
        passos: [
          'Acesse Configurações > aba Impressão',
          'Selecione o tipo de impressora (Térmica ou A4)',
          'Para térmica, escolha a largura do papel (58mm ou 80mm)',
          'Defina o que mostrar: logo, endereço, telefone',
          'Personalize a mensagem do rodapé do cupom',
          'Veja a pré-visualização à direita',
          'Clique em Salvar',
        ],
      },
      {
        titulo: 'Gerenciar usuários da equipe',
        passos: [
          'Acesse Configurações > aba Usuários',
          'Clique em "Novo Usuário"',
          'Preencha nome, email e senha',
          'Selecione o perfil: Administrador ou Funcionário',
          'Clique em Salvar',
          'Para desativar, clique no ícone de olho do usuário',
        ],
      },
    ],
    dicas: [
      {
        titulo: 'Backup dos dados',
        descricao: 'Seus dados são armazenados na nuvem com backup automático. Você não precisa se preocupar com perda de dados.',
      },
      {
        titulo: 'Pré-visualize o cupom',
        descricao: 'Na aba Impressão, a pré-visualização mostra como ficará o cupom antes de imprimir. Alterne entre "Venda", "OS Entrada" e "OS Entrega" para ver todos os formatos.',
      },
    ],
  },
  {
    id: 'perfil',
    titulo: 'Perfil',
    icon: User,
    faqs: [
      {
        pergunta: 'Como alterar meu nome no sistema?',
        resposta: 'Acesse Perfil no menu lateral. Edite o campo "Nome" e clique no botão de salvar ao lado. O nome será atualizado em todo o sistema.',
      },
      {
        pergunta: 'Posso alterar meu e-mail?',
        resposta: 'Não. O e-mail de login não pode ser alterado, pois é usado como identificador da conta. Se precisar mudar, entre em contato com o suporte.',
      },
      {
        pergunta: 'Como alterar minha senha?',
        resposta: 'Acesse Perfil no menu lateral. Na seção "Alterar Senha", informe a nova senha (mínimo 6 caracteres), confirme e clique em "Alterar Senha".',
      },
    ],
    guias: [],
    dicas: [
      {
        titulo: 'Senha forte',
        descricao: 'Use uma senha com pelo menos 6 caracteres, combinando letras e números. Evite senhas óbvias como "123456".',
      },
    ],
  },
  {
    id: 'logs',
    titulo: 'Logs do Sistema',
    icon: ScrollText,
    faqs: [
      {
        pergunta: 'O que são os Logs do Sistema?',
        resposta: 'Logs são registros automáticos de eventos do sistema: erros, ações importantes, avisos e auditoria. Eles ajudam a diagnosticar problemas e rastrear atividades.',
      },
      {
        pergunta: 'Quem pode ver os logs?',
        resposta: 'Apenas usuários com perfil Administrador têm acesso à página de Logs. Funcionários veem uma mensagem de "Acesso Restrito".',
      },
      {
        pergunta: 'Quais tipos de logs existem?',
        resposta: 'Erro (vermelho): problemas no sistema. Info (azul): eventos informativos. Aviso (amarelo): situações que merecem atenção. Auditoria (roxo): ações sensíveis como login, exclusões, etc.',
      },
      {
        pergunta: 'Como filtrar os logs?',
        resposta: 'Use os filtros na parte superior: busque por mensagem ou página, filtre por tipo (Erro, Info, Aviso, Auditoria) e por categoria (Autenticação, Vendas, OS, Estoque, Sistema).',
      },
    ],
    guias: [],
    dicas: [
      {
        titulo: 'Clique para ver detalhes',
        descricao: 'Clique em qualquer linha da tabela de logs para abrir os detalhes completos, incluindo data/hora, usuário, página e dados técnicos em JSON.',
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
        resposta: 'O gateway de pagamento exige um telefone real com DDD. Acesse Configurações > aba Empresa e atualize o campo Telefone com um número válido de 10 ou 11 dígitos (ex: 11987654321). Números fictícios como 99999-9999 são rejeitados.',
      },
      {
        pergunta: 'Erro "CPF ou CNPJ inválido" no pagamento',
        resposta: 'O documento informado não passou na validação. Acesse Configurações > aba Empresa e verifique se o CPF (11 dígitos) ou CNPJ (14 dígitos) está correto. Certifique-se de que não há números a mais ou a menos.',
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
        resposta: 'Você atingiu o limite do seu plano atual (produtos, vendas ou ordens de serviço). Faça upgrade para um plano superior em Meu Plano para continuar usando o sistema sem restrições.',
      },
      {
        pergunta: 'Não consigo excluir um produto/cliente',
        resposta: 'Itens vinculados a vendas ou ordens de serviço não podem ser excluídos para manter o histórico. Use a opção "Inativar" em vez de excluir. Itens inativos não aparecem nas buscas mas ficam no histórico.',
      },
    ],
    guias: [
      {
        titulo: 'Corrigir dados para pagamento',
        passos: [
          'Acesse Configurações no menu lateral',
          'Na aba Empresa, verifique o Telefone (10-11 dígitos com DDD)',
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
