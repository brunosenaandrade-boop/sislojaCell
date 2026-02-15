import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/catalogo/[empresaId] — público, sem auth
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ empresaId: string }> }
) {
  try {
    const { empresaId } = await params

    if (!empresaId) {
      return NextResponse.json({ error: 'ID da empresa inválido' }, { status: 400 })
    }

    const db = getServiceClient()

    const { data: empresa, error: empresaError } = await db
      .from('empresas')
      .select('id, nome, nome_fantasia, logo_url, whatsapp, telefone, cor_primaria')
      .eq('id', empresaId)
      .eq('ativo', true)
      .single()

    if (empresaError || !empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    const { data: produtos } = await db
      .from('produtos')
      .select('id, nome, descricao, preco_venda, imagem_url, categoria:categorias_produtos(id, nome)')
      .eq('empresa_id', empresaId)
      .eq('exibir_catalogo', true)
      .eq('ativo', true)
      .gt('estoque_atual', 0)
      .order('nome')

    const { data: categorias } = await db
      .from('categorias_produtos')
      .select('id, nome')
      .eq('empresa_id', empresaId)
      .eq('ativo', true)
      .order('nome')

    return NextResponse.json({
      empresa: {
        id: empresa.id,
        nome: empresa.nome_fantasia || empresa.nome,
        logo_url: empresa.logo_url,
        whatsapp: empresa.whatsapp,
        telefone: empresa.telefone,
        cor_primaria: empresa.cor_primaria,
      },
      produtos: produtos || [],
      categorias: categorias || [],
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
