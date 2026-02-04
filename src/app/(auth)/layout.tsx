import { Toaster } from '@/components/ui/sonner'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        colorScheme: 'light',
        ['--background' as string]: 'oklch(1 0 0)',
        ['--foreground' as string]: 'oklch(0.145 0 0)',
        ['--card' as string]: 'oklch(1 0 0)',
        ['--card-foreground' as string]: 'oklch(0.145 0 0)',
        ['--popover' as string]: 'oklch(1 0 0)',
        ['--popover-foreground' as string]: 'oklch(0.145 0 0)',
        ['--muted' as string]: 'oklch(0.97 0 0)',
        ['--muted-foreground' as string]: 'oklch(0.556 0 0)',
        ['--border' as string]: 'oklch(0.922 0 0)',
        ['--input' as string]: 'oklch(0.922 0 0)',
        ['--ring' as string]: 'oklch(0.708 0 0)',
      }}
    >
      {children}
      <Toaster position="top-right" richColors />
    </div>
  )
}
