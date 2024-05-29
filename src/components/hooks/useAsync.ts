import { useCallback, useEffect, useState } from 'react'

export default function useAsync<T>(
  callback: () => Promise<T>,
  dependencies = []
): { loading: boolean; error: any; value: T; refresh: () => void } {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const [value, setValue] = useState<T>()

  const callbackMemoized = useCallback(() => {
    setLoading(true)
    setError(undefined)
    setValue(undefined)
    callback()
      .then(setValue)
      .catch(setError)
      .finally(() => setLoading(false))
  }, dependencies)

  useEffect(() => {
    callbackMemoized()
  }, [callbackMemoized])

  return { loading, error, value, refresh: callbackMemoized }
}
