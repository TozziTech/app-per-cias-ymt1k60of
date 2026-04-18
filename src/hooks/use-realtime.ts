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
    // Only attempt subscription if explicitly enabled and authenticated
    // to avoid premature connection attempts that lead to ClientResponseError 0
    if (!enabled || !pb.authStore.isValid) return

    let unsubscribeFn: (() => Promise<void>) | undefined
    let cancelled = false

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
      .catch((err: any) => {
        // Silent Exception Handling: Catch ClientResponseError (status 0) and handle internally
        if (err?.status === 0 || err?.isAbort) {
          console.warn(
            `[useRealtime] Silent connection error for ${collectionName}:`,
            err?.message || 'Connection closed',
          )
        } else {
          console.error(`[useRealtime] Failed to subscribe to ${collectionName}:`, err)
        }
      })

    return () => {
      cancelled = true
      if (unsubscribeFn) {
        unsubscribeFn().catch(() => {})
      }
    }
  }, [collectionName, enabled])
}

export default useRealtime
