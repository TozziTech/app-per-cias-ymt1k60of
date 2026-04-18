import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/contexts/AuthContext'

export function GlobalNotifications() {
  const { toast } = useToast()
  const navigate = useNavigate()

  let user: any = null
  try {
    const auth = useAuth()
    user = (auth as any)?.user
  } catch (e) {
    // Ignore context error
  }

  useRealtime('pericias', (e) => {
    if (e.action === 'create') {
      const record = e.record
      const userId = user?.id || pb.authStore.record?.id

      if (userId && (record.tecnico_responsavel === userId || record.perito_id === userId)) {
        toast({
          title: 'Nova Perícia Atribuída',
          description:
            record.numeroProcesso ||
            record.codigoInterno ||
            'Você tem uma nova perícia para analisar.',
          action: (
            <Button variant="outline" size="sm" onClick={() => navigate(`/pericias`)}>
              Ver
            </Button>
          ),
        })
      }
    }
  })

  return null
}
