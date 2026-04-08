import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { User, Lock, Camera, PenTool } from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  role: z.string().min(2, 'Cargo deve ter no mínimo 2 caracteres'),
})

const passwordSchema = z
  .object({
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export default function Perfil() {
  const { user, updateProfile, updatePassword } = useAuth()
  const { toast } = useToast()

  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingSignature, setIsUploadingSignature] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('signature_url')
          .eq('id', user.id)
          .single()
        if (data?.signature_url) {
          setSignatureUrl(data.signature_url)
        }
      }
    }
    loadProfile()
  }, [user])

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploadingSignature(true)
      const file = event.target.files?.[0]
      if (!file || !user) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-sig-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(fileName, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('signatures').getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ signature_url: data.publicUrl })
        .eq('id', user.id)
      if (updateError) throw updateError

      setSignatureUrl(data.publicUrl)
      toast({ title: 'Assinatura atualizada com sucesso!' })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer upload da assinatura',
        description: error.message,
      })
    } finally {
      setIsUploadingSignature(false)
    }
  }

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      role: user?.role || '',
    },
  })

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsSavingProfile(true)
    const { error } = await updateProfile(values)
    setIsSavingProfile(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar perfil',
        description: error.message,
      })
    } else {
      toast({ title: 'Perfil atualizado com sucesso!' })
    }
  }

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsSavingPassword(true)
    const { error } = await updatePassword(values.password)
    setIsSavingPassword(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar senha',
        description: error.message,
      })
    } else {
      toast({ title: 'Senha atualizada com sucesso!' })
      passwordForm.reset()
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true)
      const file = event.target.files?.[0]
      if (!file || !user) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)

      const { error: updateError } = await updateProfile({ avatar_url: data.publicUrl })
      if (updateError) throw updateError

      toast({ title: 'Avatar atualizado com sucesso!' })
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao fazer upload', description: error.message })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e credenciais.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>Atualize sua foto de perfil, nome e cargo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  {user?.avatar_url && (
                    <AvatarImage src={user.avatar_url} alt="Avatar" className="object-cover" />
                  )}
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
                >
                  <Camera className="h-6 w-6" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </div>
              {isUploading && <p className="text-xs text-muted-foreground">Enviando foto...</p>}
            </div>

            <Separator />

            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Perito, Administrador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSavingProfile} className="w-full">
                  {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Segurança
            </CardTitle>
            <CardDescription>Altere sua senha de acesso ao sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nova Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSavingPassword}
                  className="w-full"
                >
                  {isSavingPassword ? 'Atualizando...' : 'Atualizar Senha'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-primary" />
              Assinatura Digital
            </CardTitle>
            <CardDescription>
              Faça upload da sua assinatura (imagem com fundo transparente recomendada) para
              incluí-la automaticamente nos documentos e laudos gerados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-muted/10">
              {signatureUrl ? (
                <div className="space-y-6 w-full max-w-sm">
                  <div className="bg-white p-4 rounded-md border shadow-sm">
                    <img
                      src={signatureUrl}
                      alt="Assinatura"
                      className="max-h-24 object-contain mx-auto"
                    />
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('signature-upload')?.click()}
                      disabled={isUploadingSignature}
                    >
                      {isUploadingSignature ? 'Enviando...' : 'Trocar Assinatura'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        await supabase
                          .from('profiles')
                          .update({ signature_url: null })
                          .eq('id', user!.id)
                        setSignatureUrl(null)
                        toast({ title: 'Assinatura removida.' })
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <PenTool className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nenhuma assinatura cadastrada.</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                      Sua assinatura será aplicada no rodapé dos documentos gerados.
                    </p>
                  </div>
                  <Button
                    onClick={() => document.getElementById('signature-upload')?.click()}
                    disabled={isUploadingSignature}
                    className="mt-2"
                  >
                    {isUploadingSignature ? 'Enviando...' : 'Upload de Assinatura'}
                  </Button>
                </div>
              )}
              <input
                id="signature-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSignatureUpload}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
