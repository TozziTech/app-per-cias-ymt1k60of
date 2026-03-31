import { useState } from 'react'
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit } from 'lucide-react'

import { usePericias } from '@/contexts/PericiasContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PericiaForm } from '@/components/PericiaForm'

export default function Pericias() {
  const { pericias } = usePericias()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const filteredPericias = pericias.filter(
    (p) =>
      p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluído':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Concluído</Badge>
      case 'Em Andamento':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Em Andamento
          </Badge>
        )
      case 'Pendente':
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-300">
            Pendente
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cadastro de Perícias</h1>
          <p className="text-muted-foreground">Gerencie os laudos e vistorias de engenharia.</p>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Nova Perícia
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Cadastrar Nova Perícia</SheetTitle>
              <SheetDescription>
                Preencha os detalhes do novo caso. Clique em salvar quando terminar.
              </SheetDescription>
            </SheetHeader>
            <PericiaForm onSuccess={() => setIsSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium hidden sm:block">Registros</CardTitle>
            <div className="flex w-full sm:w-auto items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por ID, título ou engenheiro..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" title="Filtrar">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px] pl-4 sm:pl-6">ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="hidden md:table-cell">Data Solicit.</TableHead>
                <TableHead className="hidden lg:table-cell">Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-4 sm:pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPericias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhuma perícia encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPericias.map((pericia) => (
                  <TableRow
                    key={pericia.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium pl-4 sm:pl-6">{pericia.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{pericia.titulo}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block truncate max-w-[200px] xl:max-w-[300px]">
                        {pericia.descricao}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {new Date(pericia.dataSolicitacao).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{pericia.responsavel}</TableCell>
                    <TableCell>{getStatusBadge(pericia.status)}</TableCell>
                    <TableCell className="text-right pr-4 sm:pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Visualizar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
