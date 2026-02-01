import Link from 'next/link'
import {
  Smartphone,
  Wrench,
  ShoppingCart,
  Package,
  BarChart3,
  DollarSign,
  ClipboardList,
  Users,
  Gift,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const params = await searchParams
  const refParam = params.ref ? `?ref=${params.ref}` : ''

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ============================================ */}
      {/* HEADER / NAV */}
      {/* ============================================ */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              LC
            </div>
            <span className="text-lg font-semibold">SisLoja Cell</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Funcionalidades</a>
            <a href="#como-funciona" className="text-gray-600 hover:text-gray-900">Como funciona</a>
            <a href="#preco" className="text-gray-600 hover:text-gray-900">Preço</a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Entrar
            </Link>
            <Link
              href={`/cadastro${refParam}`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* HERO */}
      {/* ============================================ */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center md:pt-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
            <Gift className="h-4 w-4" />
            7 dias grátis para testar
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Sistema completo para sua{' '}
            <span className="text-blue-600">assistência técnica</span>
          </h1>
          <p className="mb-8 text-lg text-gray-600 md:text-xl">
            Gerencie ordens de serviço, vendas, estoque, caixa e clientes em um só lugar.
            Feito para lojas de celular e videogame.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/cadastro${refParam}`}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
            >
              Começar Grátis por 7 Dias
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#preco"
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Ver preço
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES */}
      {/* ============================================ */}
      <section id="features" className="border-t bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Tudo que sua loja precisa</h2>
            <p className="text-gray-600">Módulos completos para gerenciar toda a operação</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ClipboardList, title: 'Ordens de Serviço', desc: 'Controle cada reparo: entrada do aparelho, diagnóstico, peças usadas, status e entrega ao cliente.' },
              { icon: ShoppingCart, title: 'PDV - Ponto de Venda', desc: 'Venda rápida com busca de produtos, carrinho, múltiplas formas de pagamento e cupom.' },
              { icon: Package, title: 'Estoque', desc: 'Controle entradas, saídas, alertas de estoque mínimo e histórico completo de movimentações.' },
              { icon: DollarSign, title: 'Caixa', desc: 'Abertura, fechamento, sangria, suprimento e resumo por forma de pagamento.' },
              { icon: Users, title: 'Clientes', desc: 'Cadastro completo, histórico de compras e serviços, aniversários e busca por CEP.' },
              { icon: BarChart3, title: 'Relatórios', desc: 'Vendas, lucro líquido, ranking de produtos e serviços, tudo com exportação CSV.' },
              { icon: Wrench, title: 'Serviços', desc: 'Cadastre tipos de reparo com preço, tempo estimado e categorias (celular, videogame, tablet).' },
              { icon: Smartphone, title: 'Impressão de Cupom', desc: 'Cupom de venda e OS para impressora térmica ou padrão, com layout configurável.' },
              { icon: Gift, title: 'Programa de Indicação', desc: 'Indique outras lojas e ganhe meses grátis de acesso para cada indicação bem-sucedida.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border bg-white p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* COMO FUNCIONA */}
      {/* ============================================ */}
      <section id="como-funciona" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Como funciona</h2>
            <p className="text-gray-600">Comece a usar em menos de 5 minutos</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '1', title: 'Cadastre sua loja', desc: 'Crie sua conta gratuita com nome da empresa, email e senha. Sem burocracia.' },
              { step: '2', title: 'Configure o sistema', desc: 'Preencha os dados da empresa, configure a impressora e cadastre seus produtos e serviços.' },
              { step: '3', title: 'Comece a vender', desc: 'Abra o caixa, crie ordens de serviço, faça vendas e acompanhe tudo pelo dashboard.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  {step}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PREÇO */}
      {/* ============================================ */}
      <section id="preco" className="border-t bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Preço simples e transparente</h2>
            <p className="text-gray-600">Um único plano com tudo incluso. Sem surpresas.</p>
          </div>
          <div className="mx-auto max-w-md">
            <div className="overflow-hidden rounded-2xl border-2 border-blue-600 bg-white shadow-lg">
              <div className="bg-blue-600 px-6 py-3 text-center text-sm font-medium text-white">
                Mais popular
              </div>
              <div className="p-8">
                <h3 className="mb-1 text-2xl font-bold">Plano Anual</h3>
                <p className="mb-6 text-sm text-gray-500">Licença completa com tudo ilimitado</p>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">R$ 1.800</span>
                    <span className="text-gray-500">/ano</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">ou 12x de R$ 150 no cartão de crédito</p>
                </div>
                <Link
                  href={`/cadastro${refParam}`}
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
        </div>
      </section>

      {/* ============================================ */}
      {/* FAQ */}
      {/* ============================================ */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Perguntas frequentes</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'O teste grátis tem alguma limitação?',
                a: 'O trial de 7 dias tem limites básicos (1 usuário, 50 produtos, 30 OS e 30 vendas por mês). Após assinar o plano anual, tudo fica ilimitado.',
              },
              {
                q: 'Preciso de cartão de crédito para testar?',
                a: 'Não. O cadastro é 100% gratuito e não pede dados de pagamento. Você só paga quando decidir assinar.',
              },
              {
                q: 'Quais formas de pagamento são aceitas?',
                a: 'PIX, cartão de crédito e boleto bancário. O plano anual custa R$ 1.800. No cartão de crédito, pode ser parcelado em até 12x de R$ 150.',
              },
              {
                q: 'Posso cancelar a qualquer momento?',
                a: 'Sim. Você pode cancelar a assinatura diretamente pelo sistema. Seus dados ficam disponíveis até o fim do período pago.',
              },
              {
                q: 'Funciona no celular?',
                a: 'Sim. O sistema é responsivo e pode ser instalado como aplicativo no celular (PWA). Funciona em qualquer navegador.',
              },
              {
                q: 'Meus dados ficam seguros?',
                a: 'Sim. Usamos Supabase (PostgreSQL) com criptografia, backups automáticos e isolamento de dados por empresa. Cada loja só acessa seus próprios dados.',
              },
              {
                q: 'Como funciona o programa de indicação?',
                a: 'Você ganha um link exclusivo. Para cada loja indicada que assinar e permanecer ativa por 1 mês, você ganha 1 mês grátis de acesso. Sem limite de indicações.',
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

      {/* ============================================ */}
      {/* CTA FINAL */}
      {/* ============================================ */}
      <section className="border-t bg-blue-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Pronto para organizar sua loja?
          </h2>
          <p className="mb-8 text-blue-100">
            Comece agora com 7 dias grátis. Sem compromisso, sem cartão de crédito.
          </p>
          <Link
            href={`/cadastro${refParam}`}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-medium text-blue-600 hover:bg-blue-50"
          >
            Criar conta grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
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
              <Link href={`/cadastro${refParam}`} className="hover:text-white">Cadastrar</Link>
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
