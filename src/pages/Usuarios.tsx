import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Shield, User as UserIcon, Trash } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

import pb from '@/lib/pocketbase/client'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'

export default function Usuarios() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const isAdmin =
    user?.email === 'tozziengenharia@hotmail.com' ||
    user?.role === 'Administrador' ||
    user?.role === 'administrador' ||
    user?.role === 'Gerente' ||
    user?.role === 'Gestor'

  const fetchProfiles = useCallback(async () => {
    try {
      const data = await pb.collection('users').getFullList({ sort: 'name' })
      if (isMounted.current) {
        setProfiles(data || [])
      }
    } catch (error: any) {
      if (isMounted.current && !error.isAbort) {
        console.error(error)
        toast({ title: 'Erro ao buscar usuários', variant: 'destructive' })
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [toast])

  useEffect(() => {
    if (isAdmin) {
      fetchProfiles()
    } else {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [isAdmin, fetchProfiles])

  useRealtime(
    'users',
    () => {
      if (isAdmin) fetchProfiles()
    },
    isAdmin,
  )

  const handleRoleChange = async (profileId: string, newRole: string) => {
    try {
      await pb.collection('users').update(profileId, { role: newRole })
      if (isMounted.current) {
        toast({ title: 'Nível de acesso atualizado com sucesso' })
      }
    } catch (e: any) {
      if (!e.isAbort && isMounted.current) {
        console.error(e)
        const fieldErrors = extractFieldErrors(e)
        const errorMessage = getErrorMessage(e)
        toast({
          title: 'Erro ao atualizar nível de acesso',
          description: fieldErrors.role || errorMessage,
          variant: 'destructive',
        })
      }
    }
  }

  const handleDeleteUser = async (profileId: string) => {
    if (
      !confirm(
        'Deseja realmente excluir este usuário? Esta ação removerá o acesso dele ao sistema e não pode ser desfeita.',
      )
    )
      return

    try {
      await pb.collection('users').delete(profileId)
      if (isMounted.current) {
        toast({ title: 'Usuário excluído com sucesso' })
      }
    } catch (e: any) {
      if (!e.isAbort && isMounted.current) {
        console.error(e)
        toast({
          title: 'Erro ao excluir usuário',
          description: getErrorMessage(e),
          variant: 'destructive',
        })
      }
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in zoom-in duration-500">
        <Shield className="h-16 w-16 text-zinc-300" />
        <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">Acesso Restrito</h2>
        <p className="text-zinc-500">Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usuários e Acessos (RBAC)</h1>
        <p className="text-muted-foreground">
          Gerencie os membros da equipe e seus níveis de permissão no sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            Membros da Equipe
          </CardTitle>
          <CardDescription>
            Gestores e Administradores têm acesso total. Peritos Associados têm acesso restrito aos
            seus próprios dados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Nível Atual</TableHead>
                    <TableHead className="w-[200px]">Alterar Acesso</TableHead>
                    <TableHead className="text-right w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={pb.files.getURL(profile, profile.avatar)}
                              alt={profile.name}
                            />
                            <AvatarFallback>
                              {profile.name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{profile.name || 'Sem nome'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ['Administrador', 'Gestor', 'Gerente'].includes(profile.role)
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {profile.role || 'Usuário'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={profile.role || 'user'}
                          onValueChange={(val) => handleRoleChange(profile.id, val)}
                          disabled={profile.id === user?.id}
                        >
                          <SelectTrigger className="h-8 w-[160px]">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Administrador">Administrador</SelectItem>
                            <SelectItem value="Gestor">Gestor</SelectItem>
                            <SelectItem value="Perito Associado">Perito Associado</SelectItem>
                            <SelectItem value="user">Usuário Padrão</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 h-8 w-8"
                          onClick={() => handleDeleteUser(profile.id)}
                          disabled={profile.id === user?.id}
                          title="Excluir Usuário"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {profiles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-zinc-500 py-6">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
