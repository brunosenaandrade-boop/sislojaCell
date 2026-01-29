import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redireciona para o dashboard (ou login se nao autenticado)
  redirect('/dashboard')
}
