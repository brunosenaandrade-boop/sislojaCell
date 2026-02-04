'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  FolderOpen,
  Package,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { produtosService } from '@/services/produtos.service'
import type { CategoriaProduto } from '@/types/database'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaProduto | null>(null)
  const [categoriaParaDeletar, setCategoriaParaDeletar] = useState<string | null>(null)

  // Formulário
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const carregarCategorias = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await produtosService.listarCategorias()
      if (error) {
        toast.error('Erro ao carregar categorias: ' + error)
      } else {
        setCategorias(data || [])
      }
    } catch {
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarCategorias()
  }, [carregarCategorias])

  // Abrir dialog para nova categoria
  const abrirNovaCategoria = () => {
    setCategoriaEditando(null)
    setNome('')
    setDescricao('')
    setDialogOpen(true)
  }

  // Abrir dialog para editar categoria
  const abrirEditarCategoria = (categoria: CategoriaProduto) => {
    setCategoriaEditando(categoria)
    setNome(categoria.nome)
    setDescricao(categoria.descricao || '')
    setDialogOpen(true)
  }

  // Salvar categoria
  const handleSalvar = async () => {
    if (!nome.trim()) {
      toast.error('Informe o nome da categoria')
      return
    }

    setIsLoading(true)

    try {
      if (categoriaEditando) {
        const { error } = await produtosService.atualizarCategoria(categoriaEditando.id, nome, descricao || undefined)
        if (error) {
          toast.error('Erro ao atualizar categoria: ' + error)
        } else {
          toast.success('Categoria atualizada')
          carregarCategorias()
        }
      } else {
        const { error } = await produtosService.criarCategoria(nome, descricao || undefined)
        if (error) {
          toast.error('Erro ao criar categoria: ' + error)
        } else {
          toast.success('Categoria criada')
          carregarCategorias()
        }
      }

      setDialogOpen(false)
      setNome('')
      setDescricao('')
    } catch {
      toast.error('Erro ao salvar categoria')
    } finally {
      setIsLoading(false)
    }
  }

  // Confirmar exclusão
  const confirmarDelete = (id: string) => {
    setCategoriaParaDeletar(id)
    setDialogDeleteOpen(true)
  }

  // Deletar categoria
  const handleDelete = async () => {
    if (!categoriaParaDeletar) return
    const { error } = await produtosService.excluirCategoria(categoriaParaDeletar)
    if (error) {
      toast.error('Erro ao excluir categoria: ' + error)
    } else {
      toast.success('Categoria excluída')
      carregarCategorias()
    }
    setDialogDeleteOpen(false)
    setCategoriaParaDeletar(null)
  }

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Ações */}
        <div className="flex items-center justify-between">
          <Link href="/produtos">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Produtos
            </Button>
          </Link>
          <Button onClick={abrirNovaCategoria}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

        {/* Estatística */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Total de Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorias.length}</div>
          </CardContent>
        </Card>

        {/* Tabela de categorias */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      Nenhuma categoria cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  categorias.map((categoria) => (
                    <TableRow key={categoria.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <FolderOpen className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{categoria.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {categoria.descricao || '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => abrirEditarCategoria(categoria)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => confirmarDelete(categoria.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog Nova/Editar Categoria */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
              <DialogDescription>
                {categoriaEditando
                  ? 'Altere os dados da categoria'
                  : 'Preencha os dados para criar uma nova categoria'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Categoria *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Carregadores"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  placeholder="Descrição opcional"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvar} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Confirmar Exclusão */}
        <Dialog open={dialogDeleteOpen} onOpenChange={setDialogDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
