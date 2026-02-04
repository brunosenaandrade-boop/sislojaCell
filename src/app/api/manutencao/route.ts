import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('configuracoes_plataforma')
      .select('valor')
      .eq('chave', 'manutencao')
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = row not found, which is fine
      return NextResponse.json({ ativo: false, mensagem: '' })
    }

    return NextResponse.json(data?.valor || { ativo: false, mensagem: '' })
  } catch {
    return NextResponse.json({ ativo: false, mensagem: '' })
  }
}
