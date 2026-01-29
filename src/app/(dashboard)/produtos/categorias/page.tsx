'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
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
} from 'lucide-react'
import { toast } from 'sonner'

// Categorias mockadas com contagem de produtos
const categoriasMock = [
  { id: '1', nome: 'Carregadores', descrição: 'Carregadores de celular e tablet', produtos: 8 },
  { id: '2', nome: 'Cabos', descrição: 'Cabos USB, Lightning e outros', produtos: 12 },
  { id: '3', nome: 'Películas', descrição: 'Películas de proteção para telas', produtos: 15 },
  { id: '4', nome: 'Capas', descrição: 'Capas e cases para celulares', produtos: 20 },
  { id: '5', nome: 'Fones', descrição: 'Fones de ouvido e headsets', produtos: 6 },
  { id: '6', nome: 'Power Banks', descrição: 'Carregadores portáteis', produtos: 4 },
  { id: '7', nome: 'Acessórios', descrição: 'Acessórios diversos', produtos: 10 },
  { id: '8', nome: 'Peças', descrição: 'Peças para reparo', produtos: 25 },
]

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState(categoriasMock)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState<typeof categoriasMock[0] | null>(null)
  const [categoriaParaDeletar, setCategoriaParaDeletar] = useState<string | null>(null)

  // Formulário
  const [nome, setNome] = useState('')
  const [descrição, setDescrição] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Abrir dialog para nova categoria
  const abrirNovaCategoria = () => {
    setCategoriaEditando(null)
    setNome('')
    setDescrição('')
    setDialogOpen(true)
  }

  // Abrir dialog para editar categoria
  const abrirEditarCategoria = (categoria: typeof categoriasMock[0]) => {
    setCategoriaEditando(categoria)
    setNome(categoria.nome)
    setDescrição(categoria.descrição || '')
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
      await new Promise(resolve => setTimeout(resolve, 500))

      if (categoriaEditando) {
        // Editar
        setCategorias(categorias.map(c =>
          c.id === categoriaEditando.id
            ? { ...c, nome, descrição }
            : c
        ))
        toast.success('Categoria atualizada')
      } else {
        // Nova
        const novaCategoria = {
          id: String(Date.now()),
          nome,
          descrição,
          produtos: 0,
        }
        setCategorias([...categorias, novaCategoria])
        toast.success('Categoria criada')
      }

      setDialogOpen(false)
      setNome('')
      setDescrição('')
    } catch (error) {
      toast.error('Erro ao salvar categoria')
    } finally {
      setIsLoading(false)
    }
  }

  // Confirmar exclusão
  const confirmarDelete = (id: string) => {
    const categoria = categorias.find(c => c.id === id)
    if (categoria && categoria.produtos > 0) {
      toast.error('Não é possível excluir categoria com produtos vinculados')
      return
    }
    setCategoriaParaDeletar(id)
    setDialogDeleteOpen(true)
  }

  // Deletar categoria
  const handleDelete = () => {
    if (!categoriaParaDeletar) return
    setCategorias(categorias.filter(c => c.id !== categoriaParaDeletar))
    toast.success('Categoria excluída')
    setDialogDeleteOpen(false)
    setCategoriaParaDeletar(null)
  }

  return (
    <div className="flex flex-col">
      <Header title="Categorias de Produtos" />

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
                  <TableHead className="text-center">Produtos</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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
                        {categoria.descrição || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{categoria.produtos}</span>
                        </div>
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
                <Label htmlFor="descrição">Descrição</Label>
                <Input
                  id="descrição"
                  placeholder="Descrição opcional"
                  value={descrição}
                  onChange={(e) => setDescrição(e.target.value)}
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
