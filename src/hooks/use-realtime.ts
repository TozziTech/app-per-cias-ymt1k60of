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

    pb.collection(collectionName)
      .subscribe('*', (e) => {
        callbackRef.current(e)
      })
      .then((fn) => {
        if (cancelled) {
          fn().catch((err) =>
            console.warn(`Error unsubscribing (cancelled) for ${collectionName}:`, err),
          )
        } else {
          unsubscribeFn = fn
        }
      })
      .catch((err) => {
        console.warn(`Failed to subscribe to realtime for ${collectionName}:`, err)
      })

    return () => {
      cancelled = true
      if (unsubscribeFn) {
        unsubscribeFn().catch((err) =>
          console.warn(`Error unsubscribing from ${collectionName}:`, err),
        )
      }
    }
  }, [collectionName, enabled])
}

export default useRealtime
