import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Settings,
  Building,
  DollarSign,
  BookOpen,
  Users,
  Briefcase,
  CheckSquare,
  Shield,
  Activity,
  PhoneCall,
  Bot,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const menuGroups = [
  {
    label: 'Operação',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, adminOnly: false },
      { title: 'Gerenciamento de Perícias', url: '/pericias', icon: FileText, adminOnly: true },
      { title: 'Portal do Perito', url: '/portal-perito', icon: Briefcase, adminOnly: false },
      { title: 'Assistente Gemini', url: '/assistente', icon: Bot, adminOnly: false },
      { title: 'Calendário', url: '/calendario', icon: Calendar, adminOnly: false },
      { title: 'Tarefas', url: '/tarefas', icon: CheckSquare, adminOnly: false },
      { title: 'Captação', url: '/captacao', icon: PhoneCall, adminOnly: false },
    ],
  },
  {
    label: 'Cadastro',
    items: [
      { title: 'Cadastro de Peritos', url: '/peritos', icon: Users, adminOnly: true },
      { title: 'Financeiro', url: '/financeiro', icon: DollarSign, adminOnly: false },
      { title: 'Agenda', url: '/contatos', icon: BookOpen, adminOnly: true },
    ],
  },
  {
    label: 'Governança e Admin',
    items: [
      { title: 'Usuários e Acesso', url: '/usuarios', icon: Shield, adminOnly: true },
      { title: 'Auditoria', url: '/auditoria', icon: Activity, adminOnly: true },
      { title: 'Configurações', url: '#', icon: Settings, adminOnly: true },
    ],
  },
]

export function AppSidebar() {
  const { user } = useAuth()
  const isAdmin =
    user?.role === 'Administrador' ||
    user?.role === 'administrador' ||
    user?.role === 'Gerente' ||
    user?.role === 'Gestor'

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Building className="h-6 w-6" />
          <span className="text-lg">SysPerícias</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) => !item.adminOnly || isAdmin)

          if (visibleItems.length === 0) return null

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={({ isActive }) =>
                            isActive
                              ? 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
    </Sidebar>
  )
}
