import Link from 'next/link'
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preços - SisLoja Cell',
  description: 'A partir de R$ 150/mês no cartão em 12x. Trial grátis de 7 dias sem cartão de crédito. Sistema completo para lojas de celular.',
}

export default function PrecosPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              LC
            </div>
            <span className="text-lg font-semibold">SisLoja Cell</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o início
        </Link>
      </div>

      {/* PRICING */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold">Preço simples e transparente</h1>
          <p className="text-lg text-gray-600">
            Um único plano com tudo incluso. Teste grátis por 7 dias, sem cartão de crédito.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {/* TRIAL */}
          <div className="rounded-2xl border bg-white p-8">
            <h2 className="mb-1 text-2xl font-bold">Trial Grátis</h2>
            <p className="mb-6 text-sm text-gray-500">Teste o sistema sem compromisso</p>
            <div className="mb-6">
              <span className="text-5xl font-bold">R$ 0</span>
              <span className="text-gray-500">/7 dias</span>
            </div>
            <Link
              href="/cadastro"
              className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Criar conta grátis
            </Link>
            <ul className="space-y-3">
              {[
                '1 usuário',
                'Até 50 produtos',
                'Até 30 OS por mês',
                'Até 30 vendas por mês',
                'PDV completo',
                'Controle de estoque',
                'Gestão de caixa',
                'Relatórios básicos',
                'Impressão de cupom',
                'Suporte por email',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* PLANO ANUAL */}
          <div className="overflow-hidden rounded-2xl border-2 border-blue-600 bg-white shadow-lg">
            <div className="bg-blue-600 px-6 py-3 text-center text-sm font-medium text-white">
              Mais popular
            </div>
            <div className="p-8">
              <h2 className="mb-1 text-2xl font-bold">Plano Anual</h2>
              <p className="mb-6 text-sm text-gray-500">Licença completa com tudo ilimitado</p>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">R$ 150</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">12x no cartão ou R$ 1.800 à vista</p>
              </div>
              <Link
                href="/cadastro"
                className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
              >
                Começar com 7 dias grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <ul className="space-y-3">
                {[
                  'Usuários ilimitados',
                  'Produtos ilimitados',
                  'Ordens de serviço ilimitadas',
                  'Vendas ilimitadas',
                  'PDV completo',
                  'Controle de estoque',
                  'Gestão de caixa',
                  'Relatórios e exportação CSV',
                  'Impressão de cupom (térmica/padrão)',
                  'Backup dos dados',
                  'Suporte prioritário',
                  'Programa de indicação',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold">Comparação detalhada</h2>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left font-medium text-gray-700">Recurso</th>
                  <th className="px-6 py-4 text-center font-medium text-gray-700">Trial</th>
                  <th className="px-6 py-4 text-center font-medium text-blue-600">Plano Anual</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Usuários', '1', 'Ilimitados'],
                  ['Produtos', '50', 'Ilimitados'],
                  ['OS por mês', '30', 'Ilimitadas'],
                  ['Vendas por mês', '30', 'Ilimitadas'],
                  ['PDV', 'Sim', 'Sim'],
                  ['Estoque', 'Sim', 'Sim'],
                  ['Caixa', 'Sim', 'Sim'],
                  ['Relatórios', 'Básico', 'Completo + CSV'],
                  ['Impressão de cupom', 'Sim', 'Sim'],
                  ['Backup dos dados', 'Não', 'Sim'],
                  ['Suporte', 'Email', 'Prioritário'],
                  ['Indicação', 'Não', 'Sim'],
                  ['Duração', '7 dias', '12 meses'],
                ].map(([recurso, trial, anual]) => (
                  <tr key={recurso} className="border-b last:border-0">
                    <td className="px-6 py-3 font-medium text-gray-700">{recurso}</td>
                    <td className="px-6 py-3 text-center text-gray-600">{trial}</td>
                    <td className="px-6 py-3 text-center font-medium text-gray-900">{anual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold">Dúvidas sobre preço</h2>
          <div className="space-y-4">
            {[
              {
                q: 'O trial tem alguma limitação?',
                a: 'Sim, o trial de 7 dias tem limites básicos: 1 usuário, 50 produtos, 30 OS e 30 vendas por mês. Todas as funcionalidades estão disponíveis.',
              },
              {
                q: 'Preciso de cartão de crédito para testar?',
                a: 'Não. O cadastro é 100% gratuito e não pede dados de pagamento.',
              },
              {
                q: 'Quais formas de pagamento são aceitas?',
                a: 'PIX (à vista), boleto (à vista) ou cartão de crédito em até 12x de R$ 150/mês.',
              },
              {
                q: 'Posso cancelar a qualquer momento?',
                a: 'Sim. Você pode cancelar diretamente pelo sistema. Seus dados ficam disponíveis até o fim do período pago.',
              },
              {
                q: 'Existe desconto para pagamento à vista?',
                a: 'À vista via PIX ou boleto o valor é R$ 1.800 (economia de tempo na aprovação). No cartão, parcela em 12x de R$ 150.',
              },
              {
                q: 'Como funciona o programa de indicação?',
                a: 'Ao assinar, você recebe um link exclusivo. Para cada loja indicada que assinar e permanecer ativa por 1 mês, você ganha 1 mês grátis. Sem limite de indicações.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-lg border">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                  {q}
                  <ChevronDown className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-4 pb-4 text-sm text-gray-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-blue-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Pronto para organizar sua loja?
          </h2>
          <p className="mb-8 text-blue-100">
            Comece agora com 7 dias grátis. Sem compromisso.
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-medium text-blue-600 hover:bg-blue-50"
          >
            Criar conta grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-gray-900 py-12 text-gray-400">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                LC
              </div>
              <span className="text-sm font-medium text-white">SisLoja Cell</span>
            </div>
            <nav className="flex gap-6 text-sm">
              <Link href="/termos" className="hover:text-white">Termos de Uso</Link>
              <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
              <Link href="/login" className="hover:text-white">Entrar</Link>
              <Link href="/cadastro" className="hover:text-white">Cadastrar</Link>
            </nav>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-xs">
            &copy; {new Date().getFullYear()} SisLoja Cell. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
