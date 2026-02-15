import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade - CellFlow',
  description: 'Política de privacidade e proteção de dados do CellFlow. Em conformidade com a LGPD.',
}

export default function PrivacidadePage() {
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

        <h1 className="mb-8 text-4xl font-bold">Política de Privacidade</h1>
        <p className="mb-6 text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">1. Introdução</h2>
            <p>
              O CellFlow respeita a privacidade de seus usuários. Esta política descreve como
              coletamos, utilizamos, armazenamos e protegemos seus dados pessoais, em conformidade
              com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">2. Dados Coletados</h2>
            <p>Coletamos os seguintes dados:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>Dados de cadastro:</strong> nome, email, telefone, CPF/CNPJ, endereço da empresa</li>
              <li><strong>Dados de uso:</strong> registros de acesso, funcionalidades utilizadas, logs do sistema</li>
              <li><strong>Dados comerciais:</strong> informações de produtos, serviços, vendas, ordens de serviço e clientes cadastrados por você</li>
              <li><strong>Dados de pagamento:</strong> processados exclusivamente pela plataforma Asaas, não armazenamos dados de cartão de crédito</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">3. Finalidade do Tratamento</h2>
            <p>Seus dados são utilizados para:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Prestação do serviço de gestão (funcionalidades do sistema)</li>
              <li>Processamento de pagamentos e cobrança</li>
              <li>Comunicação sobre o serviço (atualizações, manutenções, alertas)</li>
              <li>Melhoria contínua do sistema</li>
              <li>Cumprimento de obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">4. Isolamento de Dados</h2>
            <p>
              Cada empresa possui seus dados completamente isolados. Utilizamos políticas de segurança
              no banco de dados para garantir que cada empresa acesse apenas seus próprios dados.
              Nenhuma empresa pode visualizar, editar ou acessar dados de outra empresa.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">5. Armazenamento e Segurança</h2>
            <p>
              Os dados são armazenados em infraestrutura de nuvem segura
              com as seguintes medidas de segurança:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Criptografia em trânsito (TLS/SSL)</li>
              <li>Criptografia em repouso</li>
              <li>Backups automáticos diários</li>
              <li>Isolamento de dados por empresa</li>
              <li>Autenticação segura</li>
              <li>Senhas armazenadas com hash criptográfico</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">6. Compartilhamento de Dados</h2>
            <p>Seus dados podem ser compartilhados apenas com:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li><strong>Processador de pagamentos:</strong> para cobrança e gestão financeira (nome, email, CPF/CNPJ)</li>
              <li><strong>Provedor de banco de dados:</strong> infraestrutura de armazenamento em nuvem</li>
              <li><strong>Provedor de hospedagem:</strong> infraestrutura de entrega da aplicação web</li>
            </ul>
            <p className="mt-2">
              Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins de marketing.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">7. Seus Direitos (LGPD)</h2>
            <p>Conforme a LGPD, você tem direito a:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Confirmar a existência de tratamento de seus dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a eliminação de dados desnecessários</li>
              <li>Portabilidade dos dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
            </ul>
            <p className="mt-2">
              Para exercer qualquer desses direitos, entre em contato conosco pelo email
              disponível na seção de suporte do sistema.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">8. Retenção de Dados</h2>
            <p>
              Seus dados são mantidos enquanto sua conta estiver ativa. Após o cancelamento
              da assinatura, os dados são mantidos por até 90 dias para possibilitar a
              reativação. Após esse período, os dados podem ser removidos permanentemente.
            </p>
            <p className="mt-2">
              Dados necessários para cumprimento de obrigações legais (como registros fiscais)
              podem ser mantidos por períodos maiores conforme exigido pela legislação.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">9. Cookies</h2>
            <p>
              Utilizamos cookies essenciais para o funcionamento do sistema, incluindo
              cookies de autenticação (sessão do usuário). Não utilizamos cookies de
              rastreamento ou marketing de terceiros.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">10. Alterações nesta Política</h2>
            <p>
              Esta política pode ser atualizada periodicamente. Alterações significativas
              serão comunicadas por email. Recomendamos a revisão periódica desta página.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">11. Contato</h2>
            <p>
              Em caso de dúvidas sobre esta política de privacidade ou sobre o tratamento
              de seus dados, entre em contato através do suporte disponível no sistema.
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
              <Link href="/termos" className="hover:text-white">Termos de Uso</Link>
              <Link href="/privacidade" className="text-white">Privacidade</Link>
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
