import { useCallback, useEffect, useState } from 'react'
import { sanity } from './sanity'

/** Basit GROQ hook'u: veri, yükleniyor, hata ve yenileme. */
export function useGroq<T>(query: string, params?: Record<string, unknown>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const key = JSON.stringify(params ?? {})

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      try {
        const res = await sanity.fetch<T>(query, params ?? {})
        setData(res)
        setError(null)
      } catch (e) {
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, key]
  )

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, refresh: () => load(true) }
}
