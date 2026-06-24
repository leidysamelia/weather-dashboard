import { useState, useCallback } from 'react'
import { validateLocationInput } from '../services/weatherTransform.js'
import { getWeatherForCity } from '../services/weatherService.js'
import { parseLocation } from '../utils/parseLocation.js'

export function useWeather() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWeather = useCallback(async (rawQuery) => {
    const validation = validateLocationInput(rawQuery)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const cityName = parseLocation(validation.value).split(',')[0].trim()
      const result = await getWeatherForCity(cityName)
      setData(result)
    } catch (err) {
      if (err.name === 'TypeError') {
        setError('Sin conexión a internet. Revisa tu red e intenta de nuevo.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetchWeather }
}
