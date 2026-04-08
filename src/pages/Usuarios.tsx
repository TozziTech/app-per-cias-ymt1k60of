import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Shield, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function Usuarios() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin =
    user?.role === 'Administrador' ||
    user?.role === 'administrador' ||
    user?.role === 'Gerente' ||
    user?.role === 'Gestor'

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').order('name')
    if (error) {
      toast({ title: 'Erro ao buscar usuários', variant: 'destructive' })
    } else {
      setProfiles(data || [])
    }
    setLoading(false)
  }

  const handleRoleChange = async (profileId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', profileId)
      if (error) throw error

      setProfiles((prev) => prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p)))
      toast({ title: 'Nível de acesso atualizado com sucesso' })
    } catch (e) {
      console.error(e)
      toast({ title: 'Erro ao atualizar nível de acesso', variant: 'destructive' })
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
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Nível Atual</TableHead>
                    <TableHead className="w-[200px]">Alterar Acesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.name || 'Sem nome'}</TableCell>
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
                          disabled={profile.id === user?.id} // Prevent removing own admin rights easily
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
                    </TableRow>
                  ))}
                  {profiles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-zinc-500 py-6">
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
