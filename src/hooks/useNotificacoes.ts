'use client'

import { useEffect, useRef } from 'react'
import { useNotificacoesStore } from '@/store/useNotificacoesStore'
import { useAuthStore, useCaixaStore } from '@/store/useStore'
import { getClient } from '@/lib/supabase/client'

export function useNotificacoes() {
  const { addNotificacao, temNotificacao, jaGerouHoje, setUltimaGeracao } =
    useNotificacoesStore()
  const { horaAbertura, statusCaixa } = useCaixaStore()
  const empresa = useAuthStore((s) => s.empresa)
  const gerandoRef = useRef(false)

  useEffect(() => {
    if (!empresa?.id) return
    if (jaGerouHoje()) return
    if (gerandoRef.current) return
    gerandoRef.current = true

    const empresaId = empresa.id
    const supabase = getClient()
    const hoje = new Date().toISOString().slice(0, 10)

    async function gerar() {
      try {
        // 1. Produtos com estoque baixo
        const { data: produtos } = await supabase
          .from('produtos')
          .select('nome, estoque_atual, estoque_minimo')
          .eq('empresa_id', empresaId)
          .eq('ativo', true)

        if (produtos) {
          produtos
            .filter(
              (p: { estoque_atual: number; estoque_minimo: number }) =>
                p.estoque_atual <= p.estoque_minimo
            )
            .slice(0, 10)
            .forEach((produto: { nome: string; estoque_atual: number; estoque_minimo: number }) => {
              const titulo = `Estoque baixo: ${produto.nome}`
              if (!temNotificacao('estoque', titulo)) {
                addNotificacao({
                  tipo: 'estoque',
                  titulo,
                  mensagem: `Apenas ${produto.estoque_atual} unidade(s) em estoque (mínimo: ${produto.estoque_minimo})`,
                  link: '/estoque',
                })
              }
            })
        }

        // 2. Aniversariantes do dia
        const { data: clientes } = await supabase
          .from('clientes')
          .select('nome, data_nascimento')
          .eq('empresa_id', empresaId)
          .eq('ativo', true)
          .not('data_nascimento', 'is', null)

        if (clientes) {
          const hojeDate = new Date()
          const hojeMonth = hojeDate.getMonth()
          const hojeDay = hojeDate.getDate()

          clientes
            .filter((c: { data_nascimento?: string | null }) => {
              if (!c.data_nascimento) return false
              const nasc = new Date(c.data_nascimento)
              return nasc.getMonth() === hojeMonth && nasc.getDate() === hojeDay
            })
            .forEach((cliente: { nome: string }) => {
              const titulo = `Aniversário: ${cliente.nome}`
              if (!temNotificacao('aniversario', titulo)) {
                addNotificacao({
                  tipo: 'aniversario',
                  titulo,
                  mensagem: `Hoje é aniversário de ${cliente.nome}! Que tal enviar uma mensagem?`,
                  link: '/clientes',
                })
              }
            })
        }

        // 3. OS atrasadas (previsão vencida e status aberto/em andamento)
        const { data: osAtrasadas } = await supabase
          .from('ordens_servico')
          .select('numero, data_previsao, cliente:clientes(nome), modelo_aparelho')
          .eq('empresa_id', empresaId)
          .not('status', 'in', '("finalizada","entregue","cancelada")')
          .lt('data_previsao', hoje)
          .not('data_previsao', 'is', null)
          .limit(10)

        if (osAtrasadas) {
          osAtrasadas.forEach(
            (os: {
              numero: number
              data_previsao: string
              cliente: { nome: string } | null
              modelo_aparelho: string | null
            }) => {
              const titulo = `OS #${os.numero} atrasada`
              if (!temNotificacao('os_atrasada', titulo)) {
                const nomeCliente = os.cliente?.nome || 'Cliente'
                const modelo = os.modelo_aparelho || 'Aparelho'
                addNotificacao({
                  tipo: 'os_atrasada',
                  titulo,
                  mensagem: `${nomeCliente} - ${modelo}. Previsão era ${new Date(os.data_previsao + 'T12:00:00').toLocaleDateString('pt-BR')}`,
                  link: '/ordens-servico',
                })
              }
            }
          )
        }

        // 4. Caixa aberto há muito tempo
        if (statusCaixa === 'aberto' && horaAbertura) {
          const abertura = new Date(horaAbertura)
          const agora = new Date()
          const horasAberto =
            (agora.getTime() - abertura.getTime()) / (1000 * 60 * 60)

          if (horasAberto > 12) {
            const titulo = 'Caixa aberto há mais de 12h'
            if (!temNotificacao('caixa', titulo)) {
              addNotificacao({
                tipo: 'caixa',
                titulo,
                mensagem: `O caixa está aberto desde ${abertura.toLocaleString('pt-BR')}. Considere fechar o caixa.`,
                link: '/caixa',
              })
            }
          }
        }

        setUltimaGeracao(hoje)
      } catch {
        // Silently fail - notifications are non-critical
      } finally {
        gerandoRef.current = false
      }
    }

    gerar()
  }, [empresa?.id, addNotificacao, temNotificacao, jaGerouHoje, setUltimaGeracao, statusCaixa, horaAbertura])
}
