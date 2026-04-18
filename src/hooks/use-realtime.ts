import { useEffect, useRef, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import type { RecordSubscription } from 'pocketbase'

/**
 * Hook for real-time subscriptions to a PocketBase collection.
 * ALWAYS use this hook instead of subscribing inline.
 * Uses the per-listener UnsubscribeFunc so multiple components
 * can safely subscribe to the same collection without conflicts.
 * Returns a boolean indicating if the subscription is currently active.
 */
export function useRealtime(
  collectionName: string,
  callback: (data: RecordSubscription<any>) => void,
  enabled: boolean = true,
): boolean {
  const [isConnected, setIsConnected] = useState(false)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false)
      return
    }

    let unsubscribeFn: (() => Promise<void>) | undefined
    let cancelled = false

    setIsConnected(false)

    pb.collection(collectionName)
      .subscribe('*', (e) => {
        callbackRef.current(e)
      })
      .then((fn) => {
        if (cancelled) {
          fn().catch(() => {})
        } else {
          unsubscribeFn = fn
          setIsConnected(true)
        }
      })
      .catch((error) => {
        console.warn(`[useRealtime] Failed to subscribe to ${collectionName}:`, error)
        if (!cancelled) {
          setIsConnected(false)
        }
      })

    return () => {
      cancelled = true
      setIsConnected(false)
      if (unsubscribeFn) {
        unsubscribeFn().catch(() => {})
      }
    }
  }, [collectionName, enabled])

  return isConnected
}

export default useRealtime
