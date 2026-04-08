import { Link, useLocation } from 'react-router-dom'
import { Search, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/components/ThemeProvider'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { NotificationsMenu } from './NotificationsMenu'

export function AppHeader() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  const getPageTitle = () => {
    if (location.pathname.includes('/dashboard')) return 'Dashboard'
    if (location.pathname.includes('/financeiro')) return 'Financeiro'
    if (location.pathname.includes('/pericias')) return 'Cadastro de Perícias'
    if (location.pathname.includes('/peritos')) return 'Peritos Associados'
    if (location.pathname.includes('/contatos')) return 'Contatos'
    if (location.pathname.includes('/calendario')) return 'Calendário'
    if (location.pathname.includes('/perfil')) return 'Meu Perfil'
    return 'Visão Geral'
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden md:flex items-center text-sm text-muted-foreground">
          <span>Início</span>
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">{getPageTitle()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-64 rounded-full bg-muted/50 pl-8 focus-visible:bg-background"
          />
        </div>

        <NotificationsMenu />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative h-10 w-10 rounded-full text-muted-foreground hover:text-foreground"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border border-primary/10">
                {user?.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt={user.name || 'User'}
                    className="h-full w-full object-cover rounded-full"
                  />
                )}
                <AvatarFallback className="bg-primary/5 text-primary">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                <div className="mt-2">
                  <Badge variant="secondary" className="capitalize">
                    {user?.role?.replace('_', ' ') || 'Usuário'}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/perfil" className="w-full cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair do sistema</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
