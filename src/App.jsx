import { useEffect, useRef } from 'react'
import { useWeather } from './hooks/useWeather'
import { getWeatherTheme } from './utils/weatherTheme'
import SearchBar from './components/SearchBar'
import WeatherCard from './components/WeatherCard'
import ErrorMessage from './components/ErrorMessage'
import EmptyState from './components/EmptyState'

export default function App() {
  const { data, loading, error, fetchWeather } = useWeather()
  const rootRef = useRef(document.documentElement)

  useEffect(() => {
    if (!data) {
      rootRef.current.removeAttribute('data-theme')
      return
    }
    const theme = getWeatherTheme(data.weatherCode, data.isDay)
    rootRef.current.setAttribute('data-theme', theme)
  }, [data])

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-12 gap-10">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Weather Dashboard
        </h1>
        <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
          Clima en tiempo real para cualquier ciudad
        </p>
      </header>

      <SearchBar onSearch={fetchWeather} loading={loading} />

      <main className="w-full flex justify-center">
        {loading && <LoadingState />}
        {!loading && error && <ErrorMessage message={error} />}
        {!loading && !error && data && <WeatherCard data={data} />}
        {!loading && !error && !data && <EmptyState />}
      </main>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="text-center py-12 animate-pulse">
      <span className="text-6xl block mb-4">🌤️</span>
      <p style={{ color: 'var(--text-secondary)' }} className="text-sm">Obteniendo datos del clima...</p>
    </div>
  )
}
