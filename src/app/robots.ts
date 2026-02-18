import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/precos', '/cadastro', '/login', '/termos', '/privacidade'],
        disallow: [
          '/dashboard',
          '/vendas',
          '/caixa',
          '/ordens-servico',
          '/produtos',
          '/clientes',
          '/servicos',
          '/estoque',
          '/relatorios',
          '/configuracoes',
          '/admin',
          '/onboarding',
          '/perfil',
          '/planos',
          '/indicacoes',
          '/ajuda',
          '/logs',
          '/manutencao',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://cellflow.com.br/sitemap.xml',
  }
}
