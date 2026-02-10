import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/acompanhamento/[codigo] — público, sem auth
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params

    if (!codigo || codigo.length < 6) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
    }

    const db = getServiceClient()

    // Buscar OS pelo código de acompanhamento
    const { data: os, error } = await db
      .from('ordens_servico')
      .select(`
        numero,
        status,
        tipo_aparelho,
        marca,
        modelo,
        cor,
        problema_relatado,
        valor_total,
        data_entrada,
        data_previsao,
        data_finalizacao,
        data_entrega,
        empresa_id,
        itens:itens_os(id, tipo, descricao, quantidade)
      `)
      .eq('codigo_acompanhamento', codigo.toUpperCase())
      .single()

    if (error || !os) {
      return NextResponse.json({ error: 'Ordem de serviço não encontrada' }, { status: 404 })
    }

    // Buscar dados da empresa (nome, logo, contato)
    const { data: empresa } = await db
      .from('empresas')
      .select('nome, nome_fantasia, logo_url, telefone, whatsapp, cor_primaria')
      .eq('id', os.empresa_id)
      .single()

    return NextResponse.json({
      os: {
        numero: os.numero,
        status: os.status,
        tipo_aparelho: os.tipo_aparelho,
        marca: os.marca,
        modelo: os.modelo,
        cor: os.cor,
        problema_relatado: os.problema_relatado,
        valor_total: os.valor_total,
        data_entrada: os.data_entrada,
        data_previsao: os.data_previsao,
        data_finalizacao: os.data_finalizacao,
        data_entrega: os.data_entrega,
        itens: (os.itens || []).map((item: { id: string; tipo: string; descricao: string; quantidade: number }) => ({
          id: item.id,
          tipo: item.tipo,
          descricao: item.descricao,
          quantidade: item.quantidade,
        })),
      },
      empresa: empresa
        ? {
            nome: empresa.nome_fantasia || empresa.nome,
            logo_url: empresa.logo_url,
            telefone: empresa.telefone,
            whatsapp: empresa.whatsapp,
            cor_primaria: empresa.cor_primaria,
          }
        : null,
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
