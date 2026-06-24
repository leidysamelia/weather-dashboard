/**
 * Normalizes a location query typed in Spanish or English.
 * Handles: "Ciudad, País", "City, Country", "City, State", etc.
 * Returns a cleaned query string ready for the weather API.
 */

const ES_TO_EN_COUNTRIES = {
  'españa': 'Spain',
  'alemania': 'Germany',
  'francia': 'France',
  'italia': 'Italy',
  'estados unidos': 'United States',
  'reino unido': 'United Kingdom',
  'japón': 'Japan',
  'japon': 'Japan',
  'china': 'China',
  'brasil': 'Brazil',
  'argentina': 'Argentina',
  'colombia': 'Colombia',
  'méxico': 'Mexico',
  'mexico': 'Mexico',
  'chile': 'Chile',
  'perú': 'Peru',
  'peru': 'Peru',
  'venezuela': 'Venezuela',
  'ecuador': 'Ecuador',
  'bolivia': 'Bolivia',
  'paraguay': 'Paraguay',
  'uruguay': 'Uruguay',
  'cuba': 'Cuba',
  'canada': 'Canada',
  'canadá': 'Canada',
  'australia': 'Australia',
  'rusia': 'Russia',
  'india': 'India',
  'corea del sur': 'South Korea',
  'corea del norte': 'North Korea',
  'sudáfrica': 'South Africa',
  'sudafrica': 'South Africa',
  'egipto': 'Egypt',
  'marruecos': 'Morocco',
  'turquía': 'Turkey',
  'turquia': 'Turkey',
  'noruega': 'Norway',
  'suecia': 'Sweden',
  'dinamarca': 'Denmark',
  'países bajos': 'Netherlands',
  'paises bajos': 'Netherlands',
  'holanda': 'Netherlands',
  'portugal': 'Portugal',
  'suiza': 'Switzerland',
  'bélgica': 'Belgium',
  'belgica': 'Belgium',
  'grecia': 'Greece',
  'polonia': 'Poland',
  'austria': 'Austria',
  'hungría': 'Hungary',
  'hungria': 'Hungary',
}

const ES_CITY_NAMES = {
  'nueva york': 'New York',
  'nueva orleans': 'New Orleans',
  'los ángeles': 'Los Angeles',
  'los angeles': 'Los Angeles',
  'san francisco': 'San Francisco',
  'las vegas': 'Las Vegas',
  'ciudad de mexico': 'Mexico City',
  'ciudad de méxico': 'Mexico City',
  'buenos aires': 'Buenos Aires',
  'río de janeiro': 'Rio de Janeiro',
  'rio de janeiro': 'Rio de Janeiro',
  'sao paulo': 'São Paulo',
  'são paulo': 'São Paulo',
  'bogotá': 'Bogota',
  'bogota': 'Bogota',
  'lima': 'Lima',
  'santiago': 'Santiago',
  'caracas': 'Caracas',
  'quito': 'Quito',
  'la paz': 'La Paz',
  'asunción': 'Asuncion',
  'asuncion': 'Asuncion',
  'montevideo': 'Montevideo',
  'la habana': 'Havana',
  'ciudad de panamá': 'Panama City',
  'ciudad de panama': 'Panama City',
  'san josé': 'San Jose',
  'san jose': 'San Jose',
  'managua': 'Managua',
  'tegucigalpa': 'Tegucigalpa',
  'ciudad de guatemala': 'Guatemala City',
  'santo domingo': 'Santo Domingo',
}

export function parseLocation(input) {
  const raw = input.trim()
  if (!raw) return ''

  const parts = raw.split(',').map(p => p.trim())
  const cityRaw = parts[0].toLowerCase()
  const regionRaw = parts[1]?.toLowerCase().trim() || ''

  const city = ES_CITY_NAMES[cityRaw] || capitalize(parts[0])
  const region = ES_TO_EN_COUNTRIES[regionRaw] || capitalize(parts[1] || '')

  return region ? `${city},${region}` : city
}

function capitalize(str) {
  return str
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
