import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, ShieldCheck } from 'lucide-react'

export default function Index() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/analise-documentos', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.error('Sessão expirada. Faça login novamente.')
      sessionStorage.removeItem('session_expired')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { error } = await login(email, password)

    setIsSubmitting(false)

    if (error) {
      toast.error('Credenciais inválidas. Tente novamente.')
    } else {
      toast.success('Login realizado com sucesso!')
      navigate('/analise-documentos', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            SysPerícias
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Sistema de Gestão e Análise de Perícias
          </p>
        </div>

        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle>Acesse sua conta</CardTitle>
            <CardDescription>Insira suas credenciais para continuar</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>Credenciais de Teste:</p>
          <p className="mt-1 font-mono">ana@firma.com.br / Skip@Pass (Admin)</p>
          <p className="mt-1 font-mono">mariana@firma.com.br / Skip@Pass (Perito)</p>
        </div>
      </div>
    </div>
  )
}
