import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso - CellFlow',
  description: 'Termos de uso do CellFlow - Sistema de gestão para lojas de celular.',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="CellFlow" className="h-9 w-9 rounded-lg object-cover" />
            <span className="text-lg font-semibold">CellFlow</span>
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

      {/* CONTENT */}
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="mb-8 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o início
        </Link>

        <h1 className="mb-8 text-4xl font-bold">Termos de Uso</h1>
        <p className="mb-6 text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar o sistema CellFlow, você concorda com estes Termos de Uso.
              Caso não concorde com algum dos termos aqui descritos, não utilize o sistema.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">2. Descrição do Serviço</h2>
            <p>
              O CellFlow é um sistema de gestão (SaaS) desenvolvido para lojas de assistência técnica
              de celulares, videogames e dispositivos eletrônicos. O sistema oferece funcionalidades de:
              ponto de venda (PDV), ordens de serviço, controle de estoque, gestão de caixa,
              cadastro de clientes e relatórios.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">3. Cadastro e Conta</h2>
            <p>
              Para utilizar o sistema, é necessário criar uma conta fornecendo informações verdadeiras
              e atualizadas. Você é responsável pela segurança de sua senha e por todas as atividades
              realizadas em sua conta. Notifique-nos imediatamente caso suspeite de uso não autorizado.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">4. Período de Teste (Trial)</h2>
            <p>
              O CellFlow oferece um período de teste gratuito de 7 (sete) dias corridos.
              Durante o trial, o acesso é limitado a 1 usuário, 50 produtos, 30 ordens de serviço
              e 30 vendas por mês. Após o período de teste, é necessário assinar o plano pago
              para continuar utilizando o sistema.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">5. Plano e Pagamento</h2>
            <p>
              O plano anual tem valor de R$ 1.800,00 (mil e oitocentos reais), cobrado anualmente.
              O pagamento pode ser realizado à vista via PIX ou parcelado em
              até 12x de R$ 150,00 no cartão de crédito. Processado pela plataforma Asaas.
            </p>
            <p className="mt-2">
              Em caso de inadimplência, o acesso ao sistema poderá ser suspenso até a regularização
              do pagamento. Os dados serão mantidos por até 90 dias após a suspensão.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">6. Cancelamento</h2>
            <p>
              Você pode cancelar sua assinatura a qualquer momento através do sistema. Após o
              cancelamento, o acesso permanece ativo até o final do período já pago. Não há
              reembolso proporcional de valores já pagos.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">7. Programa de Indicação</h2>
            <p>
              O programa de indicação permite que clientes ativos indiquem novas lojas. Quando uma
              loja indicada assina o plano e permanece ativa por pelo menos 30 dias, o indicador
              recebe 1 (um) mês adicional de acesso gratuito. Os meses bônus são acumulativos
              e consumidos automaticamente em caso de inadimplência.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">8. Uso Aceitável</h2>
            <p>Ao utilizar o CellFlow, você concorda em:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Não utilizar o sistema para fins ilegais ou não autorizados</li>
              <li>Não tentar acessar dados de outras empresas</li>
              <li>Não realizar engenharia reversa do software</li>
              <li>Não sobrecarregar intencionalmente os servidores</li>
              <li>Manter seus dados de acesso em sigilo</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">9. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo do CellFlow, incluindo código-fonte, design, marcas e textos,
              é de propriedade exclusiva do CellFlow. Os dados inseridos por cada empresa
              permanecem de propriedade da respectiva empresa.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">10. Disponibilidade</h2>
            <p>
              Nos esforçamos para manter o sistema disponível 24/7, mas não garantimos disponibilidade
              ininterrupta. Manutenções programadas serão comunicadas com antecedência sempre que possível.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">11. Limitação de Responsabilidade</h2>
            <p>
              O CellFlow não se responsabiliza por danos indiretos, incidentais ou consequentes
              decorrentes do uso ou impossibilidade de uso do sistema. Nossa responsabilidade máxima
              é limitada ao valor pago pelo serviço nos últimos 12 meses.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">12. Alterações nos Termos</h2>
            <p>
              Reservamo-nos o direito de alterar estes Termos de Uso a qualquer momento.
              Alterações significativas serão comunicadas por email. O uso continuado do sistema
              após as alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">13. Foro</h2>
            <p>
              Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer
              litígio será resolvido no foro da comarca do domicílio do prestador do serviço.
            </p>
          </section>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t bg-gray-900 py-12 text-gray-400">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <img src="/logo.jpeg" alt="CellFlow" className="h-8 w-8 rounded-lg object-cover" />
              <span className="text-sm font-medium text-white">CellFlow</span>
            </div>
            <nav className="flex gap-6 text-sm">
              <Link href="/termos" className="text-white">Termos de Uso</Link>
              <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
              <Link href="/login" className="hover:text-white">Entrar</Link>
              <Link href="/cadastro" className="hover:text-white">Cadastrar</Link>
            </nav>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-xs">
            &copy; {new Date().getFullYear()} CellFlow. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
