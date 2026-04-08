import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Building, Lock, Mail } from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

const loginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
})

const recoverySchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
})

export default function Index() {
  const navigate = useNavigate()
  const { login, resetPassword } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isRecovering, setIsRecovering] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const recoveryForm = useForm<z.infer<typeof recoverySchema>>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true)

    try {
      const { error } = await login(values.email, values.password)

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro de autenticação',
          description: 'Credenciais inválidas. Verifique seu e-mail e senha.',
        })
      } else {
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Bem-vindo ao SysPerícias.',
        })
        navigate('/dashboard')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro de conexão',
        description: 'Não foi possível conectar ao servidor.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onRecover = async (values: z.infer<typeof recoverySchema>) => {
    setIsLoading(true)
    const { error } = await resetPassword(values.email)
    setIsLoading(false)

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message })
    } else {
      toast({ title: 'E-mail enviado!', description: 'Verifique sua caixa de entrada.' })
      setIsRecovering(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="flex flex-col items-center mb-8 text-primary">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Building className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">SysPerícias</h1>
          <p className="text-muted-foreground mt-2">Sistema de Gestão de Laudos e Perícias</p>
        </div>

        <Card className="shadow-lg border-primary/10">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">
              {isRecovering ? 'Recuperar Senha' : 'Bem-vindo'}
            </CardTitle>
            <CardDescription className="text-center">
              {isRecovering
                ? 'Digite seu e-mail para receber as instruções'
                : 'Acesse sua conta para continuar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isRecovering ? (
              <Form {...recoveryForm}>
                <form onSubmit={recoveryForm.handleSubmit(onRecover)} className="space-y-4">
                  <FormField
                    control={recoveryForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="admin@app.com" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? 'Enviando...' : 'Enviar instruções'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsRecovering(false)}
                  >
                    Voltar para o login
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="admin@app.com" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Senha</FormLabel>
                          <button
                            type="button"
                            onClick={() => setIsRecovering(true)}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Esqueceu a senha?
                          </button>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? 'Autenticando...' : 'Entrar'}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          {!isRecovering && (
            <CardFooter className="flex justify-center border-t p-4 bg-muted/20">
              <p className="text-sm text-muted-foreground text-center">
                Dica: Contas de teste
                <br />
                <strong>admin@app.com</strong> (Senha: admin123)
                <br />
                <strong>eng@app.com</strong> (Senha: engenheiro123)
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
