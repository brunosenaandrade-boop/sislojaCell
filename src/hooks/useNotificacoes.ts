'use client'

import { useEffect, useRef } from 'react'
import { useNotificacoesStore } from '@/store/useNotificacoesStore'
import { useCaixaStore } from '@/store/useStore'

// Dados mock de produtos com estoque baixo
const produtosEstoqueBaixo = [
  { nome: 'Tela iPhone 11', estoque_atual: 1, estoque_minimo: 3 },
  { nome: 'Bateria Samsung S21', estoque_atual: 0, estoque_minimo: 2 },
  { nome: 'Conector de Carga USB-C', estoque_atual: 2, estoque_minimo: 5 },
]

// Dados mock de aniversariantes
const clientesAniversariantes = [
  { nome: 'Maria Silva', data_nascimento: new Date().toISOString().slice(0, 10) },
]

// Dados mock de OS atrasadas
const osAtrasadas = [
  { numero: 1003, cliente: 'João Santos', modelo: 'iPhone 12', data_previsao: '2026-01-27' },
  { numero: 1005, cliente: 'Ana Costa', modelo: 'Samsung S22', data_previsao: '2026-01-28' },
]

export function useNotificacoes() {
  const { addNotificacao, temNotificacao, notificacoes } = useNotificacoesStore()
  const { horaAbertura, statusCaixa } = useCaixaStore()
  const geradoRef = useRef(false)

  useEffect(() => {
    if (geradoRef.current) return
    geradoRef.current = true

    // Estoque baixo
    produtosEstoqueBaixo.forEach((produto) => {
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

    // Aniversariantes do dia
    clientesAniversariantes.forEach((cliente) => {
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

    // OS atrasadas
    const hoje = new Date().toISOString().slice(0, 10)
    osAtrasadas.forEach((os) => {
      if (os.data_previsao < hoje) {
        const titulo = `OS #${os.numero} atrasada`
        if (!temNotificacao('os_atrasada', titulo)) {
          addNotificacao({
            tipo: 'os_atrasada',
            titulo,
            mensagem: `${os.cliente} - ${os.modelo}. Previsão era ${new Date(os.data_previsao + 'T12:00:00').toLocaleDateString('pt-BR')}`,
            link: '/ordens-servico',
          })
        }
      }
    })

    // Caixa aberto há muito tempo
    if (statusCaixa === 'aberto' && horaAbertura) {
      const abertura = new Date(horaAbertura)
      const agora = new Date()
      const horasAberto = (agora.getTime() - abertura.getTime()) / (1000 * 60 * 60)

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
  }, [addNotificacao, temNotificacao, notificacoes.length, statusCaixa, horaAbertura])
}
