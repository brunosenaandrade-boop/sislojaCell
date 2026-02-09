'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Search, PlayCircle, Lightbulb, BookOpen, CheckCircle2, MessageCircle, Camera, Mic, Video } from 'lucide-react'
import { categoriasAjuda, buscarNaAjuda, type CategoriaAjuda } from '@/data/helpData'
import { useTutorial } from '@/components/tutorial/TutorialProvider'

export default function AjudaPage() {
  const [busca, setBusca] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState(categoriasAjuda[0].id)
  const { iniciarTutorial } = useTutorial()

  const categoriasFiltradas = busca.trim()
    ? buscarNaAjuda(busca)
    : categoriasAjuda

  const categoriaExibida = busca.trim()
    ? categoriasFiltradas
    : categoriasFiltradas.filter((c) => c.id === categoriaAtiva)

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Central de Ajuda</h1>
            <p className="text-muted-foreground">
              Encontre respostas para suas duvidas e aprenda a usar o sistema
            </p>
          </div>
          <Button onClick={iniciarTutorial} className="shrink-0">
            <PlayCircle className="mr-2 h-4 w-4" />
            Iniciar Tour Guiado
          </Button>
        </div>

        {/* Busca */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por duvida, funcao ou palavra-chave..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Suporte Direto via WhatsApp */}
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-green-800 dark:text-green-300">
                    Suporte Direto via WhatsApp
                  </h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                  Precisa de ajuda? Fale diretamente com nosso suporte. Para agilizar o atendimento, ao relatar um problema:
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-green-700 dark:text-green-400">
                  <span className="flex items-center gap-1">
                    <Camera className="h-3.5 w-3.5" />
                    Envie prints da tela do erro
                  </span>
                  <span className="flex items-center gap-1">
                    <Mic className="h-3.5 w-3.5" />
                    Grave um audio explicando o ocorrido
                  </span>
                  <span className="flex items-center gap-1">
                    <Video className="h-3.5 w-3.5" />
                    Ou grave um video mostrando o problema
                  </span>
                </div>
              </div>
              <a
                href="https://wa.me/5548998649898?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20CellFlow"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-green-600 hover:bg-green-700 text-white shrink-0 w-full sm:w-auto">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chamar no WhatsApp
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Resultados de busca ou Tabs */}
        {busca.trim() ? (
          <div className="space-y-6">
            {categoriasFiltradas.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum resultado encontrado para "{busca}"
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tente usar outras palavras ou navegue pelas categorias abaixo.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setBusca('')}
                  >
                    Limpar busca
                  </Button>
                </CardContent>
              </Card>
            ) : (
              categoriasFiltradas.map((categoria) => (
                <CategoriaConteudo key={categoria.id} categoria={categoria} />
              ))
            )}
          </div>
        ) : (
          <Tabs value={categoriaAtiva} onValueChange={setCategoriaAtiva}>
            <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
              <TabsList className="inline-flex h-auto p-1 gap-1">
                {categoriasAjuda.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="flex items-center gap-2 px-3 py-2 whitespace-nowrap"
                  >
                    <cat.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{cat.titulo}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categoriasAjuda.map((categoria) => (
              <TabsContent key={categoria.id} value={categoria.id} className="mt-6">
                <CategoriaConteudo categoria={categoria} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  )
}

function CategoriaConteudo({ categoria }: { categoria: CategoriaAjuda }) {
  return (
    <div className="space-y-6">
      {/* Titulo da categoria (apenas na busca) */}
      <div className="flex items-center gap-2">
        <categoria.icon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">{categoria.titulo}</h2>
        <Badge variant="secondary" className="ml-2">
          {categoria.faqs.length + categoria.guias.length + categoria.dicas.length} itens
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* FAQs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4" />
                Perguntas Frequentes
              </CardTitle>
              <CardDescription>
                Duvidas mais comuns sobre {categoria.titulo.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoria.faqs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma pergunta frequente nesta categoria.
                </p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {categoria.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.pergunta}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.resposta}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Guias e Dicas */}
        <div className="space-y-6">
          {/* Guias */}
          {categoria.guias.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4" />
                  Guias Passo a Passo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoria.guias.map((guia, index) => (
                  <div key={index}>
                    <h4 className="font-medium mb-2">{guia.titulo}</h4>
                    <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                      {guia.passos.map((passo, i) => (
                        <li key={i}>{passo}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Dicas */}
          {categoria.dicas.length > 0 && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
                  <Lightbulb className="h-4 w-4" />
                  Dicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoria.dicas.map((dica, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300">
                      {dica.titulo}
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      {dica.descricao}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
