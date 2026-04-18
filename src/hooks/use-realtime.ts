import { useEffect, useRef } from 'react'
import pb from '@/lib/pocketbase/client'
import type { RecordSubscription } from 'pocketbase'

/**
 * Hook for real-time subscriptions to a PocketBase collection.
 * ALWAYS use this hook instead of subscribing inline.
 * Uses the per-listener UnsubscribeFunc so multiple components
 * can safely subscribe to the same collection without conflicts.
 */
export function useRealtime(
  collectionName: string,
  callback: (data: RecordSubscription<any>) => void,
  enabled: boolean = true,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return

    let unsubscribeFn: (() => Promise<void>) | undefined
    let cancelled = false
    let retryTimeout: ReturnType<typeof setTimeout>

    const subscribe = (retryCount = 0) => {
      if (cancelled) return

      pb.collection(collectionName)
        .subscribe('*', (e) => {
          callbackRef.current(e)
        })
        .then((fn) => {
          if (cancelled) {
            fn().catch(() => {})
          } else {
            unsubscribeFn = fn
          }
        })
        .catch((err) => {
          console.warn(`[Realtime] Failed to subscribe to ${collectionName}. Retrying...`, err)
          if (!cancelled) {
            const backoff = Math.min(1000 * 2 ** retryCount, 30000)
            retryTimeout = setTimeout(() => subscribe(retryCount + 1), backoff)
          }
        })
    }

    subscribe()

    return () => {
      cancelled = true
      clearTimeout(retryTimeout)
      if (unsubscribeFn) {
        unsubscribeFn().catch(() => {})
      }
    }
  }, [collectionName, enabled])
}

export default useRealtime
