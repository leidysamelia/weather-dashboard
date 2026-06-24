/**
 * weatherService.js — Capa de acceso a datos (llamadas de red)
 *
 * Encapsula toda comunicación con la API Open-Meteo.
 * La separación de este módulo permite sustituir el proveedor de datos
 * sin tocar los componentes de UI ni los hooks de React.
 */

import { normalizeWeatherData } from './weatherTransform.js'

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'

const CURRENT_PARAMS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'weather_code',
  'cloud_cover',
  'pressure_msl',
  'wind_speed_10m',
  'wind_direction_10m',
  'visibility',
  'is_day',
].join(',')

/**
 * Resuelve el nombre de una ciudad a coordenadas geográficas.
 * Lanza un error descriptivo si la ciudad no existe en la base de datos.
 *
 * @param {string} cityName  - Nombre de la ciudad (sin país)
 * @returns {Promise<object>} - Primer resultado de geocodificación
 */
export async function geocodeCity(cityName) {
  const url = `${GEO_URL}?name=${encodeURIComponent(cityName)}&count=5&language=es&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Error de geocodificación (${res.status})`)
  const data = await res.json()
  if (!data.results?.length) {
    throw new Error('Ciudad no encontrada. Verifica el nombre e intenta de nuevo.')
  }
  return data.results[0]
}

/**
 * Obtiene las condiciones climáticas actuales para un par de coordenadas.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object>} - Respuesta cruda de Open-Meteo forecast
 */
export async function fetchWeatherByCoords(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: CURRENT_PARAMS,
    daily: 'temperature_2m_max,temperature_2m_min',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
    forecast_days: 1,
  })
  const res = await fetch(`${WEATHER_URL}?${params}`)
  if (!res.ok) throw new Error(`Error al obtener clima (${res.status})`)
  return res.json()
}

/**
 * Orquesta geocodificación + obtención de clima y retorna el objeto
 * normalizado listo para la UI. Es el punto de entrada principal del servicio.
 *
 * @param {string} cityName
 * @returns {Promise<WeatherData>}
 */
export async function getWeatherForCity(cityName) {
  const location = await geocodeCity(cityName)
  const wx = await fetchWeatherByCoords(location.latitude, location.longitude)
  return normalizeWeatherData(location, wx.current, wx.daily)
}
