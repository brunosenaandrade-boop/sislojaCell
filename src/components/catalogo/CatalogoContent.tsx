'use client'

import { useState } from 'react'
import { MessageCircle, Package } from 'lucide-react'

interface CatalogoProduto {
  id: string
  nome: string
  descricao?: string
  preco_venda: number
  imagem_url?: string
  categoria?: { id: string; nome: string }
}

interface CatalogoContentProps {
  produtos: CatalogoProduto[]
  categorias: { id: string; nome: string }[]
  empresa: {
    nome: string
    whatsapp?: string
    cor_primaria?: string
  }
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export function CatalogoContent({ produtos, categorias, empresa }: CatalogoContentProps) {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)
  const corPrimaria = empresa.cor_primaria || '#3b82f6'
  const whatsappNumber = (empresa.whatsapp || '').replace(/\D/g, '')

  const produtosFiltrados = categoriaAtiva
    ? produtos.filter(p => p.categoria?.id === categoriaAtiva)
    : produtos

  const gerarLinkWhatsApp = (produto: CatalogoProduto) => {
    const msg = `Olá, vi o ${produto.nome} (${formatCurrency(produto.preco_venda)}) no catálogo e tenho interesse!`
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`
  }

  const categoriasComProdutos = categorias.filter(cat =>
    produtos.some(p => p.categoria?.id === cat.id)
  )

  return (
    <>
      {/* Tabs de categoria */}
      {categoriasComProdutos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setCategoriaAtiva(null)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !categoriaAtiva ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={!categoriaAtiva ? { backgroundColor: corPrimaria } : {}}
          >
            Todos
          </button>
          {categoriasComProdutos.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categoriaAtiva === cat.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={categoriaAtiva === cat.id ? { backgroundColor: corPrimaria } : {}}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      )}

      {/* Contagem */}
      <p className="text-sm text-gray-500">
        {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? 's' : ''}
      </p>

      {/* Grid de produtos */}
      {produtosFiltrados.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {produtosFiltrados.map(produto => (
            <div
              key={produto.id}
              className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden flex flex-col"
            >
              <div className="aspect-square bg-gray-50 flex items-center justify-center">
                {produto.imagem_url ? (
                  <img
                    src={produto.imagem_url}
                    alt={produto.nome}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Package className="h-10 w-10 text-gray-300" />
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{produto.nome}</p>
                {produto.descricao && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{produto.descricao}</p>
                )}
                <p className="text-lg font-bold mt-auto pt-2" style={{ color: corPrimaria }}>
                  {formatCurrency(produto.preco_venda)}
                </p>
                {whatsappNumber && (
                  <a
                    href={gerarLinkWhatsApp(produto)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Tenho Interesse
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Nenhum produto disponivel no momento.</p>
        </div>
      )}
    </>
  )
}
