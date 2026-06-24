/**
 * Maps WMO weather codes (used by Open-Meteo) to UI themes, icons and descriptions.
 * Reference: https://open-meteo.com/en/docs#weathervariables
 */

export function getWeatherTheme(wmoCode, isDay = true) {
  if (wmoCode === 0 || wmoCode === 1) return isDay ? 'sunny' : 'night'
  if (wmoCode === 2 || wmoCode === 3) return 'cloudy'
  if (wmoCode === 45 || wmoCode === 48) return 'foggy'
  if (wmoCode >= 51 && wmoCode <= 67) return 'rainy'
  if (wmoCode >= 71 && wmoCode <= 77) return 'snowy'
  if (wmoCode >= 80 && wmoCode <= 82) return 'rainy'
  if (wmoCode === 85 || wmoCode === 86) return 'snowy'
  if (wmoCode >= 95 && wmoCode <= 99) return 'stormy'
  return 'cloudy'
}

export function getWeatherIcon(wmoCode, isDay = true) {
  if (wmoCode === 0) return isDay ? '☀️' : '🌙'
  if (wmoCode === 1) return isDay ? '🌤️' : '🌙'
  if (wmoCode === 2) return '⛅'
  if (wmoCode === 3) return '☁️'
  if (wmoCode === 45 || wmoCode === 48) return '🌫️'
  if (wmoCode === 51 || wmoCode === 53) return '🌦️'
  if (wmoCode === 55) return '🌧️'
  if (wmoCode === 56 || wmoCode === 57) return '🌨️'
  if (wmoCode === 61 || wmoCode === 63) return '🌧️'
  if (wmoCode === 65) return '🌧️'
  if (wmoCode === 66 || wmoCode === 67) return '🌨️'
  if (wmoCode === 71 || wmoCode === 73) return '🌨️'
  if (wmoCode === 75 || wmoCode === 77) return '❄️'
  if (wmoCode === 80 || wmoCode === 81) return '🌦️'
  if (wmoCode === 82) return '🌧️'
  if (wmoCode === 85 || wmoCode === 86) return '🌨️'
  if (wmoCode === 95) return '⛈️'
  if (wmoCode === 96 || wmoCode === 99) return '⛈️'
  return '🌡️'
}

export const WMO_DESCRIPTIONS = {
  0: 'Cielo despejado',
  1: 'Principalmente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina con escarcha',
  51: 'Llovizna ligera',
  53: 'Llovizna moderada',
  55: 'Llovizna intensa',
  56: 'Llovizna helada ligera',
  57: 'Llovizna helada intensa',
  61: 'Lluvia ligera',
  63: 'Lluvia moderada',
  65: 'Lluvia intensa',
  66: 'Lluvia helada ligera',
  67: 'Lluvia helada intensa',
  71: 'Nevada ligera',
  73: 'Nevada moderada',
  75: 'Nevada intensa',
  77: 'Granizo de nieve',
  80: 'Chubascos ligeros',
  81: 'Chubascos moderados',
  82: 'Chubascos intensos',
  85: 'Chubascos de nieve ligeros',
  86: 'Chubascos de nieve intensos',
  95: 'Tormenta eléctrica',
  96: 'Tormenta con granizo ligero',
  99: 'Tormenta con granizo intenso',
}

export function getWindDirection(degrees) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
  return dirs[Math.round(degrees / 45) % 8]
}
