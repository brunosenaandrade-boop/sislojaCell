-- ============================================
-- SISTEMA PARA LOJA DE CELULAR - SCHEMA SQL
-- Supabase / PostgreSQL
-- Data: 26/01/2026
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: empresas (multi-tenant para futuro)
-- ============================================
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE,
    cpf VARCHAR(14),
    email VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    logo_url TEXT,
    cor_primaria VARCHAR(7) DEFAULT '#3B82F6',
    cor_secundaria VARCHAR(7) DEFAULT '#1E40AF',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: usuarios
-- ============================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE, -- Referência ao Supabase Auth
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    perfil VARCHAR(20) NOT NULL DEFAULT 'funcionario', -- 'admin', 'funcionario'
    ativo BOOLEAN DEFAULT TRUE,
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email, empresa_id)
);

-- ============================================
-- TABELA: clientes
-- ============================================
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    email VARCHAR(255),
    telefone VARCHAR(20),
    telefone2 VARCHAR(20), -- Telefone secundário
    whatsapp VARCHAR(20),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    data_nascimento DATE, -- Para lembrete de aniversário
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para busca de aniversariantes
CREATE INDEX idx_clientes_aniversario ON clientes(EXTRACT(MONTH FROM data_nascimento), EXTRACT(DAY FROM data_nascimento));
CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX idx_clientes_nome ON clientes(empresa_id, nome);
CREATE INDEX idx_clientes_telefone ON clientes(empresa_id, telefone);

-- ============================================
-- TABELA: categorias_produtos
-- ============================================
CREATE TABLE categorias_produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empresa_id, nome)
);

-- ============================================
-- TABELA: produtos
-- ============================================
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias_produtos(id) ON DELETE SET NULL,
    codigo VARCHAR(50),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    custo DECIMAL(10,2) NOT NULL DEFAULT 0,
    preco_venda DECIMAL(10,2) NOT NULL DEFAULT 0,
    estoque_atual INTEGER NOT NULL DEFAULT 0,
    estoque_minimo INTEGER NOT NULL DEFAULT 0,
    unidade VARCHAR(20) DEFAULT 'UN', -- UN, CX, KG, etc
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_produtos_empresa ON produtos(empresa_id);
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_produtos_nome ON produtos(empresa_id, nome);
CREATE INDEX idx_produtos_codigo ON produtos(empresa_id, codigo);
CREATE INDEX idx_produtos_estoque_baixo ON produtos(empresa_id, estoque_atual, estoque_minimo) WHERE estoque_atual <= estoque_minimo;

-- ============================================
-- TABELA: categorias_servicos
-- ============================================
CREATE TABLE categorias_servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL, -- 'Celular', 'Videogame', 'Tablet', etc
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empresa_id, nome)
);

-- ============================================
-- TABELA: servicos
-- ============================================
CREATE TABLE servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias_servicos(id) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) DEFAULT 'basico', -- 'basico', 'avancado'
    preco_base DECIMAL(10,2) NOT NULL DEFAULT 0,
    tempo_estimado INTEGER, -- em minutos
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_servicos_empresa ON servicos(empresa_id);
CREATE INDEX idx_servicos_categoria ON servicos(categoria_id);
CREATE INDEX idx_servicos_nome ON servicos(empresa_id, nome);

-- ============================================
-- TABELA: ordens_servico
-- ============================================
CREATE TABLE ordens_servico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL, -- quem criou
    tecnico_id UUID REFERENCES usuarios(id) ON DELETE SET NULL, -- quem executou

    -- Número da OS (sequencial por empresa)
    numero INTEGER NOT NULL,

    -- Status da OS
    status VARCHAR(30) NOT NULL DEFAULT 'aberta',
    -- 'aberta', 'em_analise', 'aguardando_peca', 'aguardando_aprovacao', 'em_andamento', 'finalizada', 'entregue', 'cancelada'

    -- Dados do aparelho
    tipo_aparelho VARCHAR(50), -- 'celular', 'videogame', 'tablet', etc
    marca VARCHAR(100),
    modelo VARCHAR(100),
    cor VARCHAR(50),
    imei VARCHAR(20),
    numero_serie VARCHAR(100),

    -- IMPORTANTE: Desbloqueio do aparelho
    senha_aparelho VARCHAR(100), -- Texto visível (tipo 'senha')
    senha_aparelho_masked VARCHAR(100), -- Representação mascarada (ex: ●●●●●●)
    tipo_desbloqueio VARCHAR(20) DEFAULT 'sem_senha', -- 'sem_senha', 'padrao', 'pin', 'senha'
    padrao_desbloqueio INTEGER[], -- Sequência do padrão de desenho (ex: {1,4,7,8,9})
    pin_desbloqueio VARCHAR(10), -- PIN numérico

    -- Condições do aparelho na entrada
    condicao_entrada TEXT, -- Descrição do estado físico
    acessorios TEXT, -- Carregador, capa, etc

    -- Problema e diagnóstico
    problema_relatado TEXT NOT NULL, -- O que o cliente disse
    diagnostico TEXT, -- Análise técnica
    solucao TEXT, -- O que foi feito

    -- Valores
    valor_servicos DECIMAL(10,2) DEFAULT 0,
    valor_produtos DECIMAL(10,2) DEFAULT 0,
    valor_desconto DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) DEFAULT 0,

    -- Pagamento
    forma_pagamento VARCHAR(30), -- 'dinheiro', 'pix', 'debito', 'credito'
    pago BOOLEAN DEFAULT FALSE,
    data_pagamento TIMESTAMP WITH TIME ZONE,

    -- Datas importantes
    data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_previsao TIMESTAMP WITH TIME ZONE,
    data_finalizacao TIMESTAMP WITH TIME ZONE,
    data_entrega TIMESTAMP WITH TIME ZONE,

    -- Observações
    observacoes TEXT,
    observacoes_internas TEXT, -- Só para funcionários

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(empresa_id, numero)
);

CREATE INDEX idx_os_empresa ON ordens_servico(empresa_id);
CREATE INDEX idx_os_cliente ON ordens_servico(cliente_id);
CREATE INDEX idx_os_status ON ordens_servico(empresa_id, status);
CREATE INDEX idx_os_data ON ordens_servico(empresa_id, data_entrada);
CREATE INDEX idx_os_numero ON ordens_servico(empresa_id, numero);

-- ============================================
-- TABELA: itens_os (serviços e produtos da OS)
-- ============================================
CREATE TABLE itens_os (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    os_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL, -- 'servico' ou 'produto'
    servico_id UUID REFERENCES servicos(id) ON DELETE SET NULL,
    produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
    descricao VARCHAR(255) NOT NULL, -- Nome do item no momento da venda
    quantidade INTEGER NOT NULL DEFAULT 1,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_custo DECIMAL(10,2) DEFAULT 0, -- Custo (para cálculo de lucro)
    valor_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_itens_os_os ON itens_os(os_id);

-- ============================================
-- TABELA: vendas (vendas diretas sem OS)
-- ============================================
CREATE TABLE vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,

    numero INTEGER NOT NULL, -- Sequencial por empresa

    -- Valores
    valor_produtos DECIMAL(10,2) DEFAULT 0,
    valor_custo_total DECIMAL(10,2) DEFAULT 0, -- Soma dos custos
    valor_desconto DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) DEFAULT 0,
    lucro_liquido DECIMAL(10,2) DEFAULT 0, -- valor_total - valor_custo_total

    -- Pagamento
    forma_pagamento VARCHAR(30) NOT NULL, -- 'dinheiro', 'pix', 'debito', 'credito'

    observacoes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(empresa_id, numero)
);

CREATE INDEX idx_vendas_empresa ON vendas(empresa_id);
CREATE INDEX idx_vendas_data ON vendas(empresa_id, created_at);
CREATE INDEX idx_vendas_cliente ON vendas(cliente_id);

-- ============================================
-- TABELA: itens_venda
-- ============================================
CREATE TABLE itens_venda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
    descricao VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_custo DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) NOT NULL,
    lucro_item DECIMAL(10,2) DEFAULT 0, -- (valor_unitario - valor_custo) * quantidade
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_itens_venda_venda ON itens_venda(venda_id);
CREATE INDEX idx_itens_venda_produto ON itens_venda(produto_id);

-- ============================================
-- TABELA: movimentacoes_estoque
-- ============================================
CREATE TABLE movimentacoes_estoque (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,

    tipo VARCHAR(20) NOT NULL, -- 'entrada', 'saida', 'ajuste', 'venda', 'os'
    quantidade INTEGER NOT NULL,
    estoque_anterior INTEGER NOT NULL,
    estoque_posterior INTEGER NOT NULL,

    -- Referência à origem da movimentação
    venda_id UUID REFERENCES vendas(id) ON DELETE SET NULL,
    os_id UUID REFERENCES ordens_servico(id) ON DELETE SET NULL,

    motivo TEXT,
    observacoes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mov_estoque_empresa ON movimentacoes_estoque(empresa_id);
CREATE INDEX idx_mov_estoque_produto ON movimentacoes_estoque(produto_id);
CREATE INDEX idx_mov_estoque_data ON movimentacoes_estoque(created_at);

-- ============================================
-- TABELA: caixa
-- ============================================
CREATE TABLE caixa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_abertura_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    usuario_fechamento_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,

    data_abertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_fechamento TIMESTAMP WITH TIME ZONE,

    valor_abertura DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_fechamento DECIMAL(10,2),

    -- Totais calculados
    total_vendas DECIMAL(10,2) DEFAULT 0,
    total_os DECIMAL(10,2) DEFAULT 0,
    total_entradas DECIMAL(10,2) DEFAULT 0,
    total_saidas DECIMAL(10,2) DEFAULT 0,
    total_esperado DECIMAL(10,2) DEFAULT 0,
    diferenca DECIMAL(10,2) DEFAULT 0,

    status VARCHAR(20) DEFAULT 'aberto', -- 'aberto', 'fechado'
    observacoes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_caixa_empresa ON caixa(empresa_id);
CREATE INDEX idx_caixa_status ON caixa(empresa_id, status);
CREATE INDEX idx_caixa_data ON caixa(empresa_id, data_abertura);

-- ============================================
-- TABELA: movimentacoes_caixa
-- ============================================
CREATE TABLE movimentacoes_caixa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caixa_id UUID NOT NULL REFERENCES caixa(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,

    tipo VARCHAR(20) NOT NULL, -- 'venda', 'os', 'sangria', 'suprimento', 'ajuste'
    valor DECIMAL(10,2) NOT NULL,

    -- Referências
    venda_id UUID REFERENCES vendas(id) ON DELETE SET NULL,
    os_id UUID REFERENCES ordens_servico(id) ON DELETE SET NULL,

    descricao TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mov_caixa_caixa ON movimentacoes_caixa(caixa_id);

-- ============================================
-- TABELA: configuracoes
-- ============================================
CREATE TABLE configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,

    -- Configurações de impressão
    impressora_termica BOOLEAN DEFAULT TRUE,
    largura_cupom INTEGER DEFAULT 80, -- 58mm ou 80mm

    -- Sequenciais
    proxima_os INTEGER DEFAULT 1,
    proxima_venda INTEGER DEFAULT 1,

    -- Mensagens personalizadas
    mensagem_cupom TEXT DEFAULT 'Obrigado pela preferência!',
    mensagem_os_entrada TEXT DEFAULT 'Guarde este comprovante.',

    -- Outros
    config_json JSONB DEFAULT '{}', -- Para configurações extras flexíveis

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(empresa_id)
);

-- ============================================
-- TABELA: logs_sistema (erros e auditoria)
-- ============================================
CREATE TABLE logs_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,

    tipo VARCHAR(20) NOT NULL, -- 'erro', 'info', 'warning', 'audit'
    categoria VARCHAR(50), -- 'auth', 'venda', 'os', 'estoque', 'sistema'

    mensagem TEXT NOT NULL,
    detalhes JSONB, -- Stack trace, dados extras, etc

    -- Info de contexto
    pagina VARCHAR(255),
    acao VARCHAR(100),
    ip VARCHAR(45),
    user_agent TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_empresa ON logs_sistema(empresa_id);
CREATE INDEX idx_logs_tipo ON logs_sistema(tipo);
CREATE INDEX idx_logs_data ON logs_sistema(created_at);
CREATE INDEX idx_logs_categoria ON logs_sistema(categoria);

-- ============================================
-- FUNCTIONS: Funções auxiliares
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_produtos_updated_at BEFORE UPDATE ON categorias_produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_servicos_updated_at BEFORE UPDATE ON categorias_servicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON ordens_servico FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON vendas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_caixa_updated_at BEFORE UPDATE ON caixa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para obter próximo número de OS
CREATE OR REPLACE FUNCTION get_proximo_numero_os(p_empresa_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_numero INTEGER;
BEGIN
    UPDATE configuracoes
    SET proxima_os = proxima_os + 1
    WHERE empresa_id = p_empresa_id
    RETURNING proxima_os - 1 INTO v_numero;

    IF v_numero IS NULL THEN
        INSERT INTO configuracoes (empresa_id, proxima_os) VALUES (p_empresa_id, 2);
        v_numero := 1;
    END IF;

    RETURN v_numero;
END;
$$ LANGUAGE plpgsql;

-- Função para obter próximo número de venda
CREATE OR REPLACE FUNCTION get_proximo_numero_venda(p_empresa_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_numero INTEGER;
BEGIN
    UPDATE configuracoes
    SET proxima_venda = proxima_venda + 1
    WHERE empresa_id = p_empresa_id
    RETURNING proxima_venda - 1 INTO v_numero;

    IF v_numero IS NULL THEN
        INSERT INTO configuracoes (empresa_id, proxima_venda) VALUES (p_empresa_id, 2);
        v_numero := 1;
    END IF;

    RETURN v_numero;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular lucro líquido de uma venda
CREATE OR REPLACE FUNCTION calcular_lucro_venda()
RETURNS TRIGGER AS $$
BEGIN
    NEW.lucro_liquido := NEW.valor_total - NEW.valor_custo_total;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calcular_lucro_venda_trigger
BEFORE INSERT OR UPDATE ON vendas
FOR EACH ROW EXECUTE FUNCTION calcular_lucro_venda();

-- Função para atualizar estoque após venda
CREATE OR REPLACE FUNCTION atualizar_estoque_venda()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.produto_id IS NOT NULL THEN
        UPDATE produtos
        SET estoque_atual = estoque_atual - NEW.quantidade
        WHERE id = NEW.produto_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER atualizar_estoque_venda_trigger
AFTER INSERT ON itens_venda
FOR EACH ROW EXECUTE FUNCTION atualizar_estoque_venda();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_os ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_sistema ENABLE ROW LEVEL SECURITY;

-- Política básica: usuários só veem/manipulam dados da sua empresa
-- Subquery reutilizada: empresa_id do usuário autenticado
-- auth.uid() retorna o UUID do Supabase Auth do usuário logado

-- ============================================
-- EMPRESAS: usuário só vê a própria empresa
-- ============================================
CREATE POLICY "Usuarios veem sua empresa" ON empresas
    FOR ALL USING (
        id IN (
            SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- USUARIOS: usuário só vê colegas da mesma empresa
-- ============================================
CREATE POLICY "Usuarios veem usuarios da sua empresa" ON usuarios
    FOR SELECT USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
        )
    );

-- Apenas admins podem inserir/atualizar/deletar usuarios
CREATE POLICY "Admins gerenciam usuarios da sua empresa" ON usuarios
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid() AND perfil = 'admin'
        )
    );

-- Usuário pode atualizar seu próprio registro
CREATE POLICY "Usuario atualiza proprio perfil" ON usuarios
    FOR UPDATE USING (
        auth_id = auth.uid()
    );

-- ============================================
-- CLIENTES
-- ============================================
CREATE POLICY "Usuarios veem clientes da sua empresa" ON clientes
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- CATEGORIAS_PRODUTOS
-- ============================================
CREATE POLICY "Usuarios veem categorias_produtos da sua empresa" ON categorias_produtos
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- PRODUTOS
-- ============================================
CREATE POLICY "Usuarios veem produtos da sua empresa" ON produtos
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- CATEGORIAS_SERVICOS
-- ============================================
CREATE POLICY "Usuarios veem categorias_servicos da sua empresa" ON categorias_servicos
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- SERVICOS
-- ============================================
CREATE POLICY "Usuarios veem servicos da sua empresa" ON servicos
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- ORDENS_SERVICO
-- ============================================
CREATE POLICY "Usuarios veem ordens_servico da sua empresa" ON ordens_servico
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- ITENS_OS: acesso via OS da mesma empresa
-- ============================================
CREATE POLICY "Usuarios veem itens_os da sua empresa" ON itens_os
    FOR ALL USING (
        os_id IN (
            SELECT id FROM ordens_servico WHERE empresa_id IN (
                SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
            )
        )
    );

-- ============================================
-- VENDAS
-- ============================================
CREATE POLICY "Usuarios veem vendas da sua empresa" ON vendas
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- ITENS_VENDA: acesso via venda da mesma empresa
-- ============================================
CREATE POLICY "Usuarios veem itens_venda da sua empresa" ON itens_venda
    FOR ALL USING (
        venda_id IN (
            SELECT id FROM vendas WHERE empresa_id IN (
                SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
            )
        )
    );

-- ============================================
-- MOVIMENTACOES_ESTOQUE
-- ============================================
CREATE POLICY "Usuarios veem movimentacoes_estoque da sua empresa" ON movimentacoes_estoque
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- CAIXA
-- ============================================
CREATE POLICY "Usuarios veem caixa da sua empresa" ON caixa
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- MOVIMENTACOES_CAIXA: acesso via caixa da mesma empresa
-- ============================================
CREATE POLICY "Usuarios veem movimentacoes_caixa da sua empresa" ON movimentacoes_caixa
    FOR ALL USING (
        caixa_id IN (
            SELECT id FROM caixa WHERE empresa_id IN (
                SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
            )
        )
    );

-- ============================================
-- CONFIGURACOES
-- ============================================
CREATE POLICY "Usuarios veem configuracoes da sua empresa" ON configuracoes
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- LOGS_SISTEMA
-- ============================================
CREATE POLICY "Usuarios veem logs da sua empresa" ON logs_sistema
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- DADOS INICIAIS (para demo)
-- ============================================

-- Inserir empresa demo (descomentar para usar)
/*
INSERT INTO empresas (id, nome, nome_fantasia, telefone, cidade, estado)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Loja Demo',
    'CellTech Assistência',
    '(48) 99999-9999',
    'Florianópolis',
    'SC'
);

-- Inserir configurações da empresa demo
INSERT INTO configuracoes (empresa_id)
VALUES ('a0000000-0000-0000-0000-000000000001');

-- Inserir categorias de produtos demo
INSERT INTO categorias_produtos (empresa_id, nome) VALUES
('a0000000-0000-0000-0000-000000000001', 'Acessórios'),
('a0000000-0000-0000-0000-000000000001', 'Peças'),
('a0000000-0000-0000-0000-000000000001', 'Capas'),
('a0000000-0000-0000-0000-000000000001', 'Carregadores'),
('a0000000-0000-0000-0000-000000000001', 'Fones de Ouvido');

-- Inserir categorias de serviços demo
INSERT INTO categorias_servicos (empresa_id, nome) VALUES
('a0000000-0000-0000-0000-000000000001', 'Celular'),
('a0000000-0000-0000-0000-000000000001', 'Videogame'),
('a0000000-0000-0000-0000-000000000001', 'Tablet');
*/

-- ============================================
-- FIM DO SCHEMA
-- ============================================
