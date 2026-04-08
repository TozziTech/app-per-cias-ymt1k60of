import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { PericiasProvider } from '@/contexts/PericiasContext'
import { ThemeProvider } from '@/components/ThemeProvider'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Financeiro from './pages/Financeiro'
import Pericias from './pages/Pericias'
import Calendario from './pages/Calendario'
import Perfil from './pages/Perfil'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <ThemeProvider defaultTheme="system" storageKey="app-pericias-theme">
      <AuthProvider>
        <PericiasProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Index />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="/pericias" element={<Pericias />} />
                  <Route path="/calendario" element={<Calendario />} />
                  <Route path="/perfil" element={<Perfil />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </PericiasProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)

export default App
