/**
 * SUITE: Transformación de Datos del Clima
 *
 * PROPÓSITO DE NEGOCIO:
 * Garantiza que los datos crudos de Open-Meteo se convierten correctamente
 * al modelo interno antes de llegar a la UI. Un fallo aquí puede mostrar
 * temperaturas incorrectas, iconos erróneos o descripciones confusas al usuario.
 */

import {
  normalizeWeatherData,
  formatVisibility,
  validateLocationInput,
  degreesToCardinal,
} from '../../src/services/weatherTransform.js'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_LOCATION = {
  name: 'Madrid',
  country_code: 'es',
  admin1: 'Comunidad de Madrid',
  latitude: 40.4165,
  longitude: -3.7026,
}

const MOCK_CURRENT = {
  temperature_2m: 37.6,
  apparent_temperature: 35.2,
  relative_humidity_2m: 13,
  weather_code: 0,
  cloud_cover: 0,
  pressure_msl: 1011.4,
  wind_speed_10m: 10.2,
  wind_direction_10m: 220,
  visibility: 24140,
  is_day: 1,
  time: '2024-06-24T14:00',
}

const MOCK_DAILY = {
  temperature_2m_max: [39.1],
  temperature_2m_min: [22.3],
}

// ─── normalizeWeatherData ─────────────────────────────────────────────────────

describe('normalizeWeatherData() — Normalización de la respuesta de la API', () => {
  let result

  beforeEach(() => {
    result = normalizeWeatherData(MOCK_LOCATION, MOCK_CURRENT, MOCK_DAILY)
  })

  /**
   * NEGOCIO: El nombre de la ciudad es el título principal de la tarjeta de clima.
   * Si se corrompe, el usuario no sabrá a qué ciudad corresponden los datos.
   */
  it('extrae el nombre de la ciudad sin modificarlo', () => {
    expect(result.name).toBe('Madrid')
  })

  /**
   * NEGOCIO: El código de país se muestra como indicador de ubicación (ej. "ES").
   * Debe estar en mayúsculas para seguir el estándar ISO 3166-1 alpha-2.
   */
  it('convierte el country_code a mayúsculas (es → ES)', () => {
    expect(result.country).toBe('ES')
  })

  /**
   * NEGOCIO: Mostrar decimales de temperatura confunde al usuario.
   * La regla es redondear siempre al entero más cercano (37.6 → 38).
   */
  it('redondea la temperatura actual al entero más cercano', () => {
    expect(result.temp).toBe(38)
  })

  /**
   * NEGOCIO: La sensación térmica ayuda al usuario a decidir qué ropa ponerse.
   * También debe redondearse para mantener consistencia visual con la temperatura.
   */
  it('redondea la sensación térmica al entero más cercano', () => {
    expect(result.feelsLike).toBe(35)
  })

  /**
   * NEGOCIO: El flag is_day determina si se muestra ☀️ o 🌙 y qué tema visual aplicar.
   * La API devuelve 1/0 (número); la UI espera true/false (booleano).
   */
  it('convierte is_day=1 (número) a true (booleano)', () => {
    expect(result.isDay).toBe(true)
  })

  it('convierte is_day=0 (número) a false (booleano)', () => {
    const r = normalizeWeatherData(MOCK_LOCATION, { ...MOCK_CURRENT, is_day: 0 }, MOCK_DAILY)
    expect(r.isDay).toBe(false)
  })

  /**
   * NEGOCIO: La descripción textual (ej. "Cielo despejado") es la información
   * principal que lee el usuario. Debe corresponder exactamente al código WMO recibido.
   */
  it('asigna la descripción correcta al código WMO 0 (cielo despejado)', () => {
    expect(result.description).toBe('Cielo despejado')
  })

  it('asigna descripción correcta al código WMO 61 (lluvia ligera)', () => {
    const r = normalizeWeatherData(MOCK_LOCATION, { ...MOCK_CURRENT, weather_code: 61 }, MOCK_DAILY)
    expect(r.description).toBe('Lluvia ligera')
  })

  it('asigna descripción correcta al código WMO 95 (tormenta eléctrica)', () => {
    const r = normalizeWeatherData(MOCK_LOCATION, { ...MOCK_CURRENT, weather_code: 95 }, MOCK_DAILY)
    expect(r.description).toBe('Tormenta eléctrica')
  })

  /**
   * NEGOCIO: Si la API devuelve un código WMO desconocido (por versión futura),
   * la app no debe romper; muestra un texto genérico en lugar de "undefined".
   */
  it('usa "Condición desconocida" para códigos WMO no reconocidos', () => {
    const r = normalizeWeatherData(MOCK_LOCATION, { ...MOCK_CURRENT, weather_code: 999 }, MOCK_DAILY)
    expect(r.description).toBe('Condición desconocida')
  })

  /**
   * NEGOCIO: Las temperaturas mínima y máxima del día son esenciales para
   * planificar actividades. Deben redondearse igual que la temperatura actual.
   */
  it('incluye temperatura mínima y máxima del día redondeadas', () => {
    expect(result.tempMax).toBe(39) // 39.1 → 39
    expect(result.tempMin).toBe(22) // 22.3 → 22
  })

  /**
   * NEGOCIO: Si la API no devuelve dato de dirección de viento,
   * la app no debe romper; se usa 0° (Norte) como valor por defecto.
   */
  it('usa 0° como dirección de viento por defecto si no llega el dato', () => {
    const r = normalizeWeatherData(
      MOCK_LOCATION,
      { ...MOCK_CURRENT, wind_direction_10m: undefined },
      MOCK_DAILY,
    )
    expect(r.windDir).toBe(0)
  })

  /**
   * NEGOCIO: Sin dato de visibilidad la app no debe romper;
   * se expone null para que la UI muestre "—".
   */
  it('expone null cuando la API no devuelve dato de visibilidad', () => {
    const r = normalizeWeatherData(
      MOCK_LOCATION,
      { ...MOCK_CURRENT, visibility: undefined },
      MOCK_DAILY,
    )
    expect(r.visibility).toBeNull()
  })
})

// ─── formatVisibility ─────────────────────────────────────────────────────────

describe('formatVisibility() — Formato de visibilidad para el usuario', () => {
  /**
   * NEGOCIO: Mostrar "24140 m" no es legible. La regla es convertir a km
   * con un decimal cuando el valor supera los 1000 metros.
   */
  it('muestra en km con un decimal cuando visibilidad ≥ 1000 m', () => {
    expect(formatVisibility(24140)).toBe('24.1 km')
    expect(formatVisibility(1000)).toBe('1.0 km')
  })

  /**
   * NEGOCIO: En condiciones de niebla la visibilidad puede ser < 1000 m;
   * en ese caso los metros son la unidad más precisa y significativa.
   */
  it('muestra en metros cuando visibilidad < 1000 m', () => {
    expect(formatVisibility(500)).toBe('500 m')
    expect(formatVisibility(0)).toBe('0 m')
  })

  /**
   * NEGOCIO: Algunos sensores no reportan visibilidad. Mostrar "undefined" o
   * "null" al usuario sería una mala experiencia; se usa "—" como placeholder.
   */
  it('retorna "—" cuando no hay dato de visibilidad', () => {
    expect(formatVisibility(null)).toBe('—')
    expect(formatVisibility(undefined)).toBe('—')
  })
})

// ─── validateLocationInput ────────────────────────────────────────────────────

describe('validateLocationInput() — Validación de entrada del usuario', () => {
  /**
   * NEGOCIO: Evita llamadas a la API con queries vacíos que siempre fallan
   * y consumen cuota innecesariamente.
   */
  it('rechaza entrada vacía (string vacío)', () => {
    const r = validateLocationInput('')
    expect(r.valid).toBe(false)
    expect(r.error).toBeTruthy()
  })

  it('rechaza entrada nula o no-string', () => {
    expect(validateLocationInput(null).valid).toBe(false)
    expect(validateLocationInput(undefined).valid).toBe(false)
    expect(validateLocationInput(42).valid).toBe(false)
  })

  /**
   * NEGOCIO: Buscar una sola letra ("A") devuelve cientos de ciudades ambiguas.
   * Exigir mínimo 2 caracteres mejora la calidad de los resultados.
   */
  it('rechaza entradas de 1 solo carácter', () => {
    expect(validateLocationInput('A').valid).toBe(false)
    expect(validateLocationInput(' B ').valid).toBe(false)
  })

  /**
   * NEGOCIO: Ninguna ciudad del mundo tiene nombre compuesto solo de dígitos.
   * Rechazarlos previene búsquedas sin sentido como códigos postales o coordenadas.
   */
  it('rechaza entradas que contienen únicamente números', () => {
    expect(validateLocationInput('12345').valid).toBe(false)
    expect(validateLocationInput('28001').valid).toBe(false)
  })

  /**
   * NEGOCIO: Protege el endpoint de geocodificación contra inputs malformados
   * o intentos de inyección con strings muy largos.
   */
  it('rechaza entradas que superan los 100 caracteres', () => {
    expect(validateLocationInput('A'.repeat(101)).valid).toBe(false)
  })

  /**
   * NEGOCIO: Los formatos "Ciudad" y "Ciudad, País" son los casos de uso
   * principales de la app y deben ser siempre aceptados.
   */
  it('acepta un nombre de ciudad simple (formato "Ciudad")', () => {
    const r = validateLocationInput('Madrid')
    expect(r.valid).toBe(true)
    expect(r.value).toBe('Madrid')
  })

  it('acepta el formato "Ciudad, País"', () => {
    const r = validateLocationInput('Bogotá, Colombia')
    expect(r.valid).toBe(true)
  })

  it('elimina espacios al inicio y al final antes de validar', () => {
    const r = validateLocationInput('  Paris  ')
    expect(r.valid).toBe(true)
    expect(r.value).toBe('Paris')
  })
})

// ─── degreesToCardinal ────────────────────────────────────────────────────────

describe('degreesToCardinal() — Conversión de grados a punto cardinal', () => {
  /**
   * NEGOCIO: "Viento del SO a 10 km/h" es mucho más intuitivo que
   * "220° a 10 km/h" para el usuario promedio.
   */
  it('convierte 0° a Norte (N)', () => {
    expect(degreesToCardinal(0)).toBe('N')
  })

  it('convierte 90° a Este (E)', () => {
    expect(degreesToCardinal(90)).toBe('E')
  })

  it('convierte 180° a Sur (S)', () => {
    expect(degreesToCardinal(180)).toBe('S')
  })

  it('convierte 220° a Suroeste (SO)', () => {
    expect(degreesToCardinal(220)).toBe('SO')
  })

  it('convierte 360° a Norte (N) — equivalencia circular', () => {
    expect(degreesToCardinal(360)).toBe('N')
  })

  /**
   * NEGOCIO: Si el sensor de viento no reporta dirección,
   * la app no debe romper; muestra "—".
   */
  it('retorna "—" cuando el dato es null o NaN', () => {
    expect(degreesToCardinal(null)).toBe('—')
    expect(degreesToCardinal(NaN)).toBe('—')
  })
})
