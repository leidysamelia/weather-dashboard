/**
 * SUITE: Sistema de Temas Visuales por Condición Climática
 *
 * PROPÓSITO DE NEGOCIO:
 * La diferenciación visual por clima (colores cálidos para sol, azules para lluvia)
 * es la característica más llamativa de la app. Estas pruebas garantizan que
 * cada condición climática activa el tema correcto, asegurando coherencia entre
 * los datos recibidos y la experiencia visual que percibe el usuario.
 */

import { getWeatherTheme, getWeatherIcon } from '../../src/utils/weatherTheme.js'

describe('getWeatherTheme() — Selección de tema según condición climática', () => {
  /**
   * NEGOCIO: Cielo despejado de día debe activar el tema "sunny" (naranja cálido).
   * Es la condición más positiva y la más frecuente en búsquedas.
   */
  it('código 0 (despejado) de día → tema "sunny"', () => {
    expect(getWeatherTheme(0, true)).toBe('sunny')
  })

  it('código 1 (principalmente despejado) de día → tema "sunny"', () => {
    expect(getWeatherTheme(1, true)).toBe('sunny')
  })

  /**
   * NEGOCIO: De noche, aunque esté despejado, el tema debe ser "night"
   * (azul oscuro/morado) para reflejar la oscuridad real del entorno.
   */
  it('código 0 (despejado) de noche → tema "night"', () => {
    expect(getWeatherTheme(0, false)).toBe('night')
  })

  it('código 1 (principalmente despejado) de noche → tema "night"', () => {
    expect(getWeatherTheme(1, false)).toBe('night')
  })

  /**
   * NEGOCIO: Nublado (parcial o total) debe dar un tono gris neutro
   * que no confunda al usuario con lluvia ni con sol.
   */
  it('código 2 (parcialmente nublado) → tema "cloudy"', () => {
    expect(getWeatherTheme(2, true)).toBe('cloudy')
  })

  it('código 3 (nublado) → tema "cloudy"', () => {
    expect(getWeatherTheme(3, true)).toBe('cloudy')
  })

  /**
   * NEGOCIO: Niebla y bruma son condiciones de visibilidad reducida.
   * El tema "foggy" (gris difuminado) comunica esa pérdida de claridad.
   */
  it('código 45 (niebla) → tema "foggy"', () => {
    expect(getWeatherTheme(45, true)).toBe('foggy')
  })

  it('código 48 (niebla con escarcha) → tema "foggy"', () => {
    expect(getWeatherTheme(48, true)).toBe('foggy')
  })

  /**
   * NEGOCIO: Cualquier tipo de lluvia (llovizna, lluvia, chubascos) debe
   * mostrar el tema "rainy" (azul frío) para alertar al usuario.
   */
  it('código 51 (llovizna ligera) → tema "rainy"', () => {
    expect(getWeatherTheme(51, true)).toBe('rainy')
  })

  it('código 63 (lluvia moderada) → tema "rainy"', () => {
    expect(getWeatherTheme(63, true)).toBe('rainy')
  })

  it('código 80 (chubascos ligeros) → tema "rainy"', () => {
    expect(getWeatherTheme(80, true)).toBe('rainy')
  })

  /**
   * NEGOCIO: La nieve requiere su propio tema "snowy" (blanco/celeste)
   * porque es visualmente muy diferente a la lluvia y requiere
   * precauciones distintas por parte del usuario.
   */
  it('código 71 (nevada ligera) → tema "snowy"', () => {
    expect(getWeatherTheme(71, true)).toBe('snowy')
  })

  it('código 75 (nevada intensa) → tema "snowy"', () => {
    expect(getWeatherTheme(75, true)).toBe('snowy')
  })

  /**
   * NEGOCIO: Las tormentas eléctricas son la condición más peligrosa.
   * El tema "stormy" (morado oscuro) genera urgencia visual inmediata.
   */
  it('código 95 (tormenta eléctrica) → tema "stormy"', () => {
    expect(getWeatherTheme(95, true)).toBe('stormy')
  })

  it('código 99 (tormenta con granizo) → tema "stormy"', () => {
    expect(getWeatherTheme(99, true)).toBe('stormy')
  })
})

describe('getWeatherIcon() — Selección de icono representativo', () => {
  /**
   * NEGOCIO: El icono es el elemento visual más rápido de procesar.
   * El usuario debe identificar la condición de un vistazo, sin leer el texto.
   */
  it('código 0 de día → icono ☀️', () => {
    expect(getWeatherIcon(0, true)).toBe('☀️')
  })

  it('código 0 de noche → icono 🌙', () => {
    expect(getWeatherIcon(0, false)).toBe('🌙')
  })

  it('código 2 (parcialmente nublado) → icono ⛅', () => {
    expect(getWeatherIcon(2, true)).toBe('⛅')
  })

  it('código 63 (lluvia moderada) → icono 🌧️', () => {
    expect(getWeatherIcon(63, true)).toBe('🌧️')
  })

  it('código 75 (nevada intensa) → icono ❄️', () => {
    expect(getWeatherIcon(75, true)).toBe('❄️')
  })

  it('código 95 (tormenta) → icono ⛈️', () => {
    expect(getWeatherIcon(95, true)).toBe('⛈️')
  })

  it('código 45 (niebla) → icono 🌫️', () => {
    expect(getWeatherIcon(45, true)).toBe('🌫️')
  })

  /**
   * NEGOCIO: Para códigos no mapeados, nunca debe aparecer "undefined";
   * se usa un emoji genérico de termómetro como fallback.
   */
  it('código desconocido → icono fallback 🌡️', () => {
    expect(getWeatherIcon(999, true)).toBe('🌡️')
  })
})
