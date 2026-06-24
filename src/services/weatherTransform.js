/**
 * weatherTransform.js — Capa de transformación de datos (lógica de negocio pura)
 *
 * Contiene funciones puras sin efectos secundarios que normalizan y validan
 * los datos crudos de la API antes de exponerlos a la capa de UI.
 * Al ser funciones puras, son 100 % testeables sin mocks de red.
 */

import { WMO_DESCRIPTIONS } from '../utils/weatherTheme.js'

/**
 * Transforma la respuesta combinada de Open-Meteo (geocodificación + clima)
 * en el objeto canónico que consume la interfaz de usuario.
 *
 * @param {object} location  - Resultado de la API de geocodificación
 * @param {object} current   - Sección `current` de la API de forecast
 * @param {object} daily     - Sección `daily` de la API de forecast
 * @returns {WeatherData}
 */
export function normalizeWeatherData(location, current, daily) {
  const code = current.weather_code

  return {
    name: location.name,
    country: location.country_code?.toUpperCase() ?? '',
    region: location.admin1 ?? '',
    lat: location.latitude,
    lon: location.longitude,
    temp: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    windDir: current.wind_direction_10m ?? 0,
    pressure: Math.round(current.pressure_msl),
    visibility: current.visibility ?? null,
    cloudCover: current.cloud_cover,
    weatherCode: code,
    isDay: current.is_day === 1,
    description: WMO_DESCRIPTIONS[code] ?? 'Condición desconocida',
    tempMax: Math.round(daily.temperature_2m_max[0]),
    tempMin: Math.round(daily.temperature_2m_min[0]),
    updatedAt: current.time,
  }
}

/**
 * Formatea metros de visibilidad en una cadena legible para el usuario.
 * Regla de negocio: si ≥ 1000 m se muestra en km con un decimal;
 * si < 1000 m se muestra en metros; si no hay dato se muestra "—".
 *
 * @param {number|null} meters
 * @returns {string}
 */
export function formatVisibility(meters) {
  if (meters == null) return '—'
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${meters} m`
}

/**
 * Valida la cadena de búsqueda ingresada por el usuario antes de
 * lanzar cualquier solicitud de red, evitando llamadas innecesarias a la API.
 *
 * Reglas de negocio:
 *  - No puede estar vacía o ser nula
 *  - Mínimo 2 caracteres (evita búsquedas de una sola letra)
 *  - Máximo 100 caracteres (protege contra payloads excesivos)
 *  - No puede ser solo dígitos (una ciudad no es un número)
 *
 * @param {string} input
 * @returns {{ valid: boolean, value?: string, error?: string }}
 */
export function validateLocationInput(input) {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'El campo de búsqueda es obligatorio.' }
  }
  const trimmed = input.trim()
  if (trimmed.length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres.' }
  }
  if (trimmed.length > 100) {
    return { valid: false, error: 'El nombre es demasiado largo (máximo 100 caracteres).' }
  }
  if (/^\d+$/.test(trimmed)) {
    return { valid: false, error: 'La búsqueda no puede ser solo números.' }
  }
  return { valid: true, value: trimmed }
}

/**
 * Convierte grados de dirección del viento (0-360°) a punto cardinal.
 * Usado para mostrar "N", "NE", "SO", etc. en lugar de un número crudo.
 *
 * @param {number} degrees
 * @returns {string}
 */
export function degreesToCardinal(degrees) {
  if (degrees == null || isNaN(degrees)) return '—'
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
  return dirs[Math.round(((degrees % 360) + 360) % 360 / 45) % 8]
}
