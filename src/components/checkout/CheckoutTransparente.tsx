'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  QrCode,
  CreditCard,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

// ============================================
// TIPOS
// ============================================

type Step = 'select' | 'processing' | 'awaiting' | 'success' | 'error'
type BillingType = 'PIX' | 'CREDIT_CARD'

interface CheckoutTransparenteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planoSlug: string
  planoNome: string
  valor: number
  ciclo: string
  onSuccess: () => void
}

interface CardForm {
  holderName: string
  number: string
  expiryMonth: string
  expiryYear: string
  ccv: string
  cpfCnpj: string
  email: string
  phone: string
  postalCode: string
  addressNumber: string
}

// ============================================
// VALIDAÇÕES
// ============================================

function isValidLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let alternate = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10)
    if (alternate) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alternate = !alternate
  }
  return sum % 10 === 0
}

function isExpiryValid(month: string, year: string): boolean {
  const m = parseInt(month, 10)
  const y = parseInt(year, 10)
  if (!m || !y || m < 1 || m > 12) return false
  const fullYear = y < 100 ? 2000 + y : y
  const now = new Date()
  const expiry = new Date(fullYear, m) // first day of month after expiry
  return expiry > now
}

function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false
  for (let t = 9; t < 11; t++) {
    let sum = 0
    for (let i = 0; i < t; i++) {
      sum += parseInt(digits[i], 10) * (t + 1 - i)
    }
    let check = ((sum * 10) % 11) % 10
    if (parseInt(digits[t], 10) !== check) return false
  }
  return true
}

function isValidCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '')
  if (digits.length !== 14) return false
  if (/^(\d)\1{13}$/.test(digits)) return false
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  for (const [idx, weights] of [[12, weights1], [13, weights2]] as [number, number[]][]) {
    let sum = 0
    for (let i = 0; i < weights.length; i++) {
      sum += parseInt(digits[i], 10) * weights[i]
    }
    const check = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (parseInt(digits[idx], 10) !== check) return false
  }
  return true
}

function validateCardForm(form: CardForm): string | null {
  // Card number: Luhn + 13-19 digits
  const cardDigits = form.number.replace(/\D/g, '')
  if (cardDigits.length < 13 || cardDigits.length > 19 || !isValidLuhn(cardDigits)) {
    return 'Número do cartão inválido'
  }

  // Holder name: min 3 chars
  if (form.holderName.trim().length < 3) {
    return 'Nome no cartão deve ter pelo menos 3 caracteres'
  }

  // Expiry: not expired
  if (!isExpiryValid(form.expiryMonth, form.expiryYear)) {
    return 'Data de validade inválida ou cartão expirado'
  }

  // CVV: 3-4 digits
  const cvvDigits = form.ccv.replace(/\D/g, '')
  if (cvvDigits.length < 3 || cvvDigits.length > 4) {
    return 'CVV inválido'
  }

  // CPF/CNPJ: 11 or 14 digits + check digits
  const docDigits = form.cpfCnpj.replace(/\D/g, '')
  if (docDigits.length === 11) {
    if (!isValidCpf(docDigits)) return 'CPF inválido'
  } else if (docDigits.length === 14) {
    if (!isValidCnpj(docDigits)) return 'CNPJ inválido'
  } else {
    return 'CPF ou CNPJ inválido'
  }

  // Email: basic regex
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    return 'Email inválido'
  }

  // Phone: 10-11 digits
  const phoneDigits = form.phone.replace(/\D/g, '')
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    return 'Telefone inválido'
  }

  // CEP: 8 digits
  const cepDigits = form.postalCode.replace(/\D/g, '')
  if (cepDigits.length !== 8) {
    return 'CEP inválido'
  }

  // Address number: not empty
  if (!form.addressNumber.trim()) {
    return 'Número do endereço é obrigatório'
  }

  return null
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function CheckoutTransparente({
  open,
  onOpenChange,
  planoSlug,
  planoNome,
  valor,
  ciclo,
  onSuccess,
}: CheckoutTransparenteProps) {
  const [step, setStep] = useState<Step>('select')
  const [activeBilling, setActiveBilling] = useState<BillingType>('PIX')
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // PIX state
  const [pixQrImage, setPixQrImage] = useState('')
  const [pixPayload, setPixPayload] = useState('')
  const [pixCopied, setPixCopied] = useState(false)


  // Card form state
  const [cardForm, setCardForm] = useState<CardForm>({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
    cpfCnpj: '',
    email: '',
    phone: '',
    postalCode: '',
    addressNumber: '',
  })
  const [installments, setInstallments] = useState('1')

  // Cleanup on close
  useEffect(() => {
    if (!open) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      setStep('select')
      setPaymentId(null)
      setPixQrImage('')
      setPixPayload('')
      setErrorMsg('')
      setPixCopied(false)
    }
  }, [open])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  // ============================================
  // POLLING PIX STATUS
  // ============================================
  const startPolling = useCallback((pId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current)

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/asaas/payment/${pId}/status`)
        if (!res.ok) return

        const json = await res.json()
        if (['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(json.status)) {
          if (pollingRef.current) clearInterval(pollingRef.current)
          pollingRef.current = null
          setStep('success')
        }
      } catch {
        // Ignore polling errors
      }
    }, 5000)
  }, [])

  // ============================================
  // CRIAR CHECKOUT
  // ============================================
  const handleCheckout = async (billing: BillingType) => {
    setActiveBilling(billing)
    setStep('processing')
    setErrorMsg('')

    try {
      const payload: Record<string, unknown> = {
        planoSlug,
        ciclo,
        billingType: billing,
      }

      if (billing === 'CREDIT_CARD') {
        // Validar campos do cartão
        const validationError = validateCardForm(cardForm)
        if (validationError) {
          setStep('select')
          toast.error(validationError)
          return
        }

        payload.creditCard = {
          holderName: cardForm.holderName,
          number: cardForm.number.replace(/\s/g, ''),
          expiryMonth: cardForm.expiryMonth,
          expiryYear: cardForm.expiryYear,
          ccv: cardForm.ccv,
        }
        payload.creditCardHolderInfo = {
          name: cardForm.holderName,
          email: cardForm.email,
          cpfCnpj: cardForm.cpfCnpj.replace(/\D/g, ''),
          postalCode: cardForm.postalCode.replace(/\D/g, ''),
          addressNumber: cardForm.addressNumber,
          phone: cardForm.phone.replace(/\D/g, ''),
        }
        if (Number(installments) > 1) {
          payload.installmentCount = Number(installments)
        }
      }

      const res = await fetch('/api/asaas/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error || 'Erro ao processar pagamento')
        setStep('error')
        return
      }

      setPaymentId(json.paymentId)

      if (billing === 'PIX' && json.paymentId) {
        // Buscar QR Code
        const pixRes = await fetch(`/api/asaas/payment/${json.paymentId}/pix`)
        if (pixRes.ok) {
          const pixData = await pixRes.json()
          setPixQrImage(pixData.encodedImage)
          setPixPayload(pixData.payload)
          setStep('awaiting')
          startPolling(json.paymentId)
        } else {
          setErrorMsg('Erro ao gerar QR Code PIX')
          setStep('error')
        }
      } else if (billing === 'CREDIT_CARD') {
        // Cartão é processado imediatamente
        const status = json.status
        if (['RECEIVED', 'CONFIRMED', 'ACTIVE'].includes(status)) {
          setStep('success')
        } else if (status === 'PENDING') {
          setStep('success')
        } else {
          setErrorMsg('Pagamento recusado. Verifique os dados do cartão.')
          setStep('error')
        }
      } else {
        // Fallback
        setStep('success')
      }
    } catch {
      setErrorMsg('Erro de conexão. Tente novamente.')
      setStep('error')
    }
  }

  // ============================================
  // HELPERS
  // ============================================
  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload)
    setPixCopied(true)
    toast.success('Código PIX copiado!')
    setTimeout(() => setPixCopied(false), 2000)
  }

  const updateCard = (field: keyof CardForm, value: string) => {
    setCardForm((prev) => ({ ...prev, [field]: value }))
  }

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14)
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
    }
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
  }

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    return digits.replace(/(\d{5})(\d)/, '$1-$2')
  }

  // ============================================
  // RENDER - TELA DE SUCESSO
  // ============================================
  if (step === 'success') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-xl font-bold text-green-700">Pagamento Confirmado!</h2>
            <p className="text-center text-sm text-muted-foreground">
              Sua assinatura do plano {planoNome} foi ativada com sucesso.
            </p>
            <Button
              onClick={() => {
                onOpenChange(false)
                onSuccess()
              }}
              className="mt-4"
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // ============================================
  // RENDER - TELA DE ERRO
  // ============================================
  if (step === 'error') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-8">
            <XCircle className="h-16 w-16 text-red-500" />
            <h2 className="text-xl font-bold text-red-700">Erro no Pagamento</h2>
            <p className="text-center text-sm text-muted-foreground">{errorMsg}</p>
            <Button variant="outline" onClick={() => setStep('select')} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // ============================================
  // RENDER - PROCESSANDO
  // ============================================
  if (step === 'processing') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
            <p className="text-sm text-muted-foreground">Processando pagamento...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // ============================================
  // RENDER - AGUARDANDO PIX
  // ============================================
  if (step === 'awaiting') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pagamento via PIX</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Escaneie o QR Code ou copie o código para pagar
            </p>
            <div className="rounded-lg border bg-white p-4">
              {pixQrImage && (
                <img
                  src={`data:image/png;base64,${pixQrImage}`}
                  alt="QR Code PIX"
                  className="h-48 w-48"
                />
              )}
            </div>
            <div className="w-full">
              <Label className="text-xs text-muted-foreground">Código Copia e Cola</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  value={pixPayload}
                  readOnly
                  className="text-xs"
                />
                <Button variant="outline" size="icon" onClick={handleCopyPix}>
                  {pixCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Aguardando confirmação do pagamento...
            </div>
            <p className="text-xs text-muted-foreground">
              Valor: <strong>{formatCurrency(valor)}</strong>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // ============================================
  // RENDER - SELEÇÃO (step === 'select')
  // ============================================

  const installmentOptions = []
  for (let i = 1; i <= 12; i++) {
    const parcelValue = valor / i
    installmentOptions.push({
      value: String(i),
      label: i === 1
        ? `À vista ${formatCurrency(valor)}`
        : `${i}x de ${formatCurrency(parcelValue)}`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assinar {planoNome}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(valor)} / {ciclo === 'YEARLY' ? 'ano' : 'mês'}
          </p>
        </DialogHeader>

        <Tabs defaultValue="PIX" onValueChange={(v) => setActiveBilling(v as BillingType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="PIX" className="gap-1">
              <QrCode className="h-4 w-4" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="CREDIT_CARD" className="gap-1">
              <CreditCard className="h-4 w-4" />
              Cartão
            </TabsTrigger>
          </TabsList>

          {/* ===== ABA PIX ===== */}
          <TabsContent value="PIX" className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <QrCode className="mx-auto mb-2 h-12 w-12 text-violet-600" />
              <p className="text-sm font-medium">Pagamento instantâneo via PIX</p>
              <p className="text-xs text-muted-foreground">
                O QR Code será gerado ao clicar no botão abaixo
              </p>
            </div>
            <Button className="w-full" onClick={() => handleCheckout('PIX')}>
              <QrCode className="mr-2 h-4 w-4" />
              Gerar QR Code PIX — {formatCurrency(valor)}
            </Button>
          </TabsContent>

          {/* ===== ABA CARTÃO ===== */}
          <TabsContent value="CREDIT_CARD" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="cardNumber">Número do Cartão</Label>
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={formatCardNumber(cardForm.number)}
                  onChange={(e) => updateCard('number', e.target.value.replace(/\D/g, ''))}
                  maxLength={19}
                />
              </div>

              <div>
                <Label htmlFor="holderName">Nome no Cartão</Label>
                <Input
                  id="holderName"
                  placeholder="NOME COMO NO CARTÃO"
                  value={cardForm.holderName}
                  onChange={(e) => updateCard('holderName', e.target.value.toUpperCase())}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="expiryMonth">Mês</Label>
                  <Select
                    value={cardForm.expiryMonth}
                    onValueChange={(v) => updateCard('expiryMonth', v)}
                  >
                    <SelectTrigger id="expiryMonth">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => {
                        const m = String(i + 1).padStart(2, '0')
                        return <SelectItem key={m} value={m}>{m}</SelectItem>
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expiryYear">Ano</Label>
                  <Select
                    value={cardForm.expiryYear}
                    onValueChange={(v) => updateCard('expiryYear', v)}
                  >
                    <SelectTrigger id="expiryYear">
                      <SelectValue placeholder="AA" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const y = String(new Date().getFullYear() + i).slice(-2)
                        return <SelectItem key={y} value={y}>{y}</SelectItem>
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ccv">CVV</Label>
                  <Input
                    id="ccv"
                    placeholder="000"
                    value={cardForm.ccv}
                    onChange={(e) => updateCard('ccv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                  />
                </div>
              </div>

              <hr className="my-2" />
              <p className="text-xs font-medium text-muted-foreground">Dados do Titular</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                  <Input
                    id="cpfCnpj"
                    placeholder="000.000.000-00"
                    value={formatCpf(cardForm.cpfCnpj)}
                    onChange={(e) => updateCard('cpfCnpj', e.target.value.replace(/\D/g, ''))}
                    maxLength={18}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={cardForm.email}
                    onChange={(e) => updateCard('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={formatPhone(cardForm.phone)}
                    onChange={(e) => updateCard('phone', e.target.value.replace(/\D/g, ''))}
                    maxLength={15}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">CEP</Label>
                  <Input
                    id="postalCode"
                    placeholder="00000-000"
                    value={formatCep(cardForm.postalCode)}
                    onChange={(e) => updateCard('postalCode', e.target.value.replace(/\D/g, ''))}
                    maxLength={9}
                  />
                </div>
                <div>
                  <Label htmlFor="addressNumber">Nº</Label>
                  <Input
                    id="addressNumber"
                    placeholder="123"
                    value={cardForm.addressNumber}
                    onChange={(e) => updateCard('addressNumber', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="installments">Parcelas</Label>
                <Select value={installments} onValueChange={setInstallments}>
                  <SelectTrigger id="installments">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {installmentOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full" onClick={() => handleCheckout('CREDIT_CARD')}>
              <CreditCard className="mr-2 h-4 w-4" />
              Pagar {installments === '1'
                ? formatCurrency(valor)
                : `${installments}x de ${formatCurrency(valor / Number(installments))}`}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
