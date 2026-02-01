import { useAuthStore } from '@/store/useStore'

export function usePermissao() {
  const { usuario } = useAuthStore()

  const perfil = usuario?.perfil || 'funcionario'
  const isSuperadmin = perfil === 'superadmin'
  const isAdmin = perfil === 'admin' || isSuperadmin

  return {
    isAdmin,
    isSuperadmin,
    podeAcessarConfiguracoes: isAdmin,
    podeAcessarRelatorios: isAdmin,
    podeAcessarLogs: isAdmin,
    podeExcluirRegistros: isAdmin,
    podeGerenciarUsuarios: isAdmin,
    podeAcessarAdmin: isSuperadmin,
  }
}
