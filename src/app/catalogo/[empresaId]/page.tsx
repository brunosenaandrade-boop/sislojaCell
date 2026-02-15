import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { CatalogoContent } from '@/components/catalogo/CatalogoContent'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CatalogoData {
  empresa: {
    id: string
    nome: string
    logo_url?: string
    whatsapp?: string
    telefone?: string
    cor_primaria?: string
  }
  produtos: {
    id: string
    nome: string
    descricao?: string
    preco_venda: number
    imagem_url?: string
    categoria?: { id: string; nome: string }
  }[]
  categorias: { id: string; nome: string }[]
}

async function fetchCatalogo(empresaId: string): Promise<CatalogoData | null> {
  try {
    if (!empresaId) return null

    const db = getServiceClient()

    const { data: empresa, error: empresaError } = await db
      .from('empresas')
      .select('id, nome, nome_fantasia, logo_url, whatsapp, telefone, cor_primaria')
      .eq('id', empresaId)
      .eq('ativo', true)
      .single()

    if (empresaError || !empresa) return null

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

    return {
      empresa: {
        id: empresa.id,
        nome: empresa.nome_fantasia || empresa.nome,
        logo_url: empresa.logo_url,
        whatsapp: empresa.whatsapp,
        telefone: empresa.telefone,
        cor_primaria: empresa.cor_primaria,
      },
      produtos: (produtos || []).map((p: Record<string, unknown>) => ({
        ...p,
        categoria: Array.isArray(p.categoria) ? p.categoria[0] || null : p.categoria,
      })) as CatalogoData['produtos'],
      categorias: categorias || [],
    }
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ empresaId: string }> }
): Promise<Metadata> {
  const { empresaId } = await params
  const data = await fetchCatalogo(empresaId)

  if (!data) {
    return { title: 'Catalogo nao encontrado - CellFlow' }
  }

  return {
    title: `Catalogo - ${data.empresa.nome} | CellFlow`,
    description: `Confira os produtos de ${data.empresa.nome}. Capas, peliculas, carregadores e mais.`,
  }
}

export default async function CatalogoPage({
  params,
}: {
  params: Promise<{ empresaId: string }>
}) {
  const { empresaId } = await params
  const data = await fetchCatalogo(empresaId)

  if (!data || !data.empresa) {
    notFound()
  }

  const { empresa, produtos, categorias } = data
  const corPrimaria = empresa.cor_primaria || '#3b82f6'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="CellFlow" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-sm font-semibold text-gray-700">CellFlow</span>
          </Link>
          <span className="text-xs text-gray-400">Catalogo Digital</span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 space-y-4">
        {/* Card da empresa */}
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            {empresa.logo_url ? (
              <img
                src={empresa.logo_url}
                alt={empresa.nome}
                className="h-12 w-12 rounded-lg object-contain border border-gray-100"
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg text-white text-lg font-bold"
                style={{ backgroundColor: corPrimaria }}
              >
                {empresa.nome.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-semibold text-gray-900">{empresa.nome}</h1>
              <p className="text-sm text-gray-500">Catalogo de Produtos</p>
            </div>
          </div>
        </div>

        {/* Conteudo do catalogo */}
        <CatalogoContent
          produtos={produtos}
          categorias={categorias}
          empresa={empresa}
        />

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <Link href="/" className="text-blue-500 hover:underline">
              CellFlow
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
