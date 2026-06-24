/**
 * SUITE: Normalización de Entrada de Ubicación
 *
 * PROPÓSITO DE NEGOCIO:
 * Los usuarios pueden escribir en español o inglés, con o sin país.
 * Esta suite garantiza que el parser siempre entrega al servicio de
 * geocodificación un string limpio y coherente, sin importar el idioma
 * o el formato que use el usuario.
 */

import { parseLocation } from '../../src/utils/parseLocation.js'

describe('parseLocation() — Normalización del input de búsqueda', () => {
  /**
   * NEGOCIO: El caso de uso más común es escribir "Ciudad, País".
   * El parser debe extraer la ciudad capitalizada correctamente.
   */
  it('extrae y capitaliza la ciudad desde "Ciudad, País"', () => {
    expect(parseLocation('london, uk')).toBe('London,Uk')
  })

  /**
   * NEGOCIO: Cuando el usuario no especifica país, la búsqueda
   * debe funcionar igual con solo el nombre de la ciudad.
   */
  it('devuelve solo la ciudad cuando no hay parte de país', () => {
    expect(parseLocation('Tokyo')).toBe('Tokyo')
  })

  /**
   * NEGOCIO: Los usuarios hispanohablantes escribirán nombres como
   * "Nueva York" en lugar de "New York". El parser los traduce
   * para maximizar el éxito de geocodificación.
   */
  it('traduce nombres de ciudades en español a inglés (Nueva York → New York)', () => {
    expect(parseLocation('nueva york')).toBe('New York')
  })

  it('traduce "Ciudad de México" a "Mexico City"', () => {
    expect(parseLocation('ciudad de mexico')).toBe('Mexico City')
  })

  it('traduce "Rio de Janeiro" correctamente', () => {
    expect(parseLocation('rio de janeiro')).toBe('Rio de Janeiro')
  })

  /**
   * NEGOCIO: Los nombres de países en español deben traducirse al inglés
   * porque la API de geocodificación usa nombres en inglés internacionalmente.
   */
  it('traduce el país de español a inglés (España → Spain)', () => {
    expect(parseLocation('Madrid, España')).toBe('Madrid,Spain')
  })

  it('traduce "Alemania" a "Germany"', () => {
    expect(parseLocation('Berlin, Alemania')).toBe('Berlin,Germany')
  })

  it('traduce "Francia" a "France" (preserva tilde del input original)', () => {
    // "París" con tilde es aceptado correctamente por la API de geocodificación
    expect(parseLocation('París, Francia')).toBe('París,France')
  })

  /**
   * NEGOCIO: Los usuarios a menudo añaden espacios extra por descuido.
   * El parser debe ignorarlos para no degradar la búsqueda.
   */
  it('elimina espacios extra alrededor de ciudad y país', () => {
    const result = parseLocation('  Madrid  ,  España  ')
    expect(result).toBe('Madrid,Spain')
  })

  /**
   * NEGOCIO: Una búsqueda vacía no debe llegar nunca a la API.
   * El parser devuelve string vacío para que el hook pueda cortocircuitar.
   */
  it('devuelve string vacío si el input está vacío', () => {
    expect(parseLocation('')).toBe('')
    expect(parseLocation('   ')).toBe('')
  })
})
