import { NextResponse } from 'next/server'
import { verifySuperadmin, getServiceClient } from '../../superadmin/route-utils'

// ============================================
// POST /api/setup/init-superadmin-tables
// Cria tabelas de superadmin no banco (superadmin only)
// ============================================

const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS cupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  descricao TEXT,
  tipo_desconto VARCHAR(20) NOT NULL DEFAULT 'percentual',
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_minimo DECIMAL(10,2) DEFAULT 0,
  max_usos INTEGER,
  usos_atuais INTEGER DEFAULT 0,
  plano_restrito VARCHAR(50),
  data_inicio TIMESTAMPTZ DEFAULT NOW(),
  data_expiracao TIMESTAMPTZ,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS avisos_plataforma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(200) NOT NULL,
  mensagem TEXT NOT NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'info',
  alvo_tipo VARCHAR(20) NOT NULL DEFAULT 'todos',
  alvo_valor VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  criado_por UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS avisos_lidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aviso_id UUID NOT NULL,
  empresa_id UUID NOT NULL,
  lido_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(aviso_id, empresa_id)
);

CREATE TABLE IF NOT EXISTS tickets_suporte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID,
  numero SERIAL,
  protocolo VARCHAR(50),
  assunto VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'aberto',
  prioridade VARCHAR(20) NOT NULL DEFAULT 'media',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets_suporte(id) ON DELETE CASCADE,
  autor_id UUID,
  autor_tipo VARCHAR(20) NOT NULL DEFAULT 'empresa',
  mensagem TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tickets_suporte ADD COLUMN IF NOT EXISTS protocolo VARCHAR(50);
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tickets_suporte_empresa_id_fkey'
  ) THEN
    ALTER TABLE tickets_suporte ADD CONSTRAINT tickets_suporte_empresa_id_fkey
      FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ticket_mensagens_ticket_id_fkey'
  ) THEN
    ALTER TABLE ticket_mensagens ADD CONSTRAINT ticket_mensagens_ticket_id_fkey
      FOREIGN KEY (ticket_id) REFERENCES tickets_suporte(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS configuracoes_plataforma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO configuracoes_plataforma (chave, valor) VALUES ('manutencao', '{"ativo": false, "mensagem": "Sistema em manutenção. Voltaremos em breve."}') ON CONFLICT (chave) DO NOTHING;
`.trim()

export async function POST() {
  try {
    const auth = await verifySuperadmin()
    if ('error' in auth) return auth.error

    const serviceClient = getServiceClient()

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Tentativa 1: endpoint /pg/query (Supabase Management API local)
    let executed = false
    let executionMethod = ''

    try {
      const pgRes = await fetch(`${SUPABASE_URL}/pg/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: CREATE_TABLES_SQL }),
      })

      if (pgRes.ok) {
        executed = true
        executionMethod = 'pg/query'
      }
    } catch {
      // endpoint nao disponivel, tentar proximo
    }

    // Tentativa 2: RPC exec_sql (funcao customizada no banco)
    if (!executed) {
      try {
        const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'apikey': SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({ sql: CREATE_TABLES_SQL }),
        })

        if (rpcRes.ok) {
          executed = true
          executionMethod = 'rpc/exec_sql'
        }
      } catch {
        // endpoint nao disponivel
      }
    }

    // Se nenhum endpoint DDL funcionou, verificar se as tabelas ja existem
    if (!executed) {
      const tables = ['cupons', 'avisos_plataforma', 'avisos_lidos', 'tickets_suporte', 'ticket_mensagens', 'configuracoes_plataforma']
      const existingTables: string[] = []
      const missingTables: string[] = []

      for (const table of tables) {
        const { error } = await serviceClient.from(table).select('id').limit(1)
        if (error) {
          missingTables.push(table)
        } else {
          existingTables.push(table)
        }
      }

      if (missingTables.length === 0) {
        return NextResponse.json({
          success: true,
          message: `Todas as ${tables.length} tabelas ja existem no banco.`,
          tables: existingTables,
        })
      }

      // Tabelas faltando e não conseguimos criar via API
      return NextResponse.json(
        {
          error: `Não foi possível criar as tabelas via API. ${missingTables.length} tabela(s) faltando: ${missingTables.join(', ')}. Execute o SQL manualmente no Supabase Dashboard (SQL Editor).`,
          missing_tables: missingTables,
          existing_tables: existingTables,
          sql: CREATE_TABLES_SQL,
        },
        { status: 422 }
      )
    }

    // Verificar se as tabelas foram criadas com sucesso
    const tables = ['cupons', 'avisos_plataforma', 'avisos_lidos', 'tickets_suporte', 'ticket_mensagens', 'configuracoes_plataforma']
    const results: Record<string, string> = {}

    for (const table of tables) {
      const { error } = await serviceClient.from(table).select('id').limit(1)
      results[table] = error ? `erro: ${error.message}` : 'ok'
    }

    return NextResponse.json({
      success: true,
      message: `Tabelas criadas com sucesso via ${executionMethod}.`,
      tables: results,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
