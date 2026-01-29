import { useAuthStore } from '@/store/useStore'

export function usePermissao() {
  const { usuario } = useAuthStore()

  const perfil = usuario?.perfil || 'funcionario'
  const isAdmin = perfil === 'admin'

  return {
    isAdmin,
    podeAcessarConfiguracoes: isAdmin,
    podeAcessarRelatorios: isAdmin,
    podeAcessarLogs: isAdmin,
    podeExcluirRegistros: isAdmin,
    podeGerenciarUsuarios: isAdmin,
  }
}
