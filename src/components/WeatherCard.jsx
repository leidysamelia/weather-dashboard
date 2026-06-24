import { getWeatherIcon } from '../utils/weatherTheme'
import { formatVisibility, degreesToCardinal } from '../services/weatherTransform'

export default function WeatherCard({ data }) {
  const icon = getWeatherIcon(data.weatherCode, data.isDay)
  const windDir = degreesToCardinal(data.windDir)

  return (
    <div className="weather-card p-8 w-full max-w-xl mx-auto animate-fade-in">
      {/* Location */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-primary leading-tight">
            {data.name}
          </h2>
          <p className="text-secondary text-sm mt-1 font-medium">
            {[data.region, data.country].filter(Boolean).join(', ')} · {data.isDay ? 'Día' : 'Noche'}
          </p>
        </div>
        <span className="text-6xl leading-none" aria-label={data.description}>
          {icon}
        </span>
      </div>

      {/* Temperature */}
      <div className="mb-6">
        <div className="flex items-end gap-3">
          <span className="text-8xl font-thin text-primary leading-none">
            {data.temp}°
          </span>
          <span className="text-2xl font-light text-secondary mb-2">C</span>
        </div>
        <p className="text-secondary text-sm mt-2 capitalize font-medium">
          {data.description}
        </p>
        <p className="text-secondary text-sm mt-0.5">
          Sensación térmica: <span className="text-primary font-semibold">{data.feelsLike}°C</span>
        </p>
      </div>

      {/* Divider */}
      <div className="border-theme border-t mb-6" />

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        <StatItem label="Humedad"    value={`${data.humidity}%`}            icon="💧" />
        <StatItem label="Viento"     value={`${data.windSpeed} km/h`}       icon="💨" sub={windDir} />
        <StatItem label="Presión"    value={`${data.pressure} hPa`}         icon="🌡️" />
        <StatItem label="Visibilidad"  value={formatVisibility(data.visibility)} icon="👁️" />
        <StatItem label="Nubosidad"  value={`${data.cloudCover}%`}          icon="☁️" />
        <StatItem label="Mín / Máx"  value={`${data.tempMin}° / ${data.tempMax}°`} icon="📊" />
      </div>

      {/* Footer */}
      <p className="text-secondary text-xs text-center mt-6 opacity-50">
        Actualizado a las {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        {' · '}Fuente: Open-Meteo
      </p>
    </div>
  )
}

function StatItem({ label, value, sub, icon }) {
  return (
    <div
      className="flex flex-col items-center text-center p-3 rounded-xl gap-1"
      style={{ background: 'color-mix(in srgb, var(--accent) 8%, transparent)', border: '1px solid var(--border)' }}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-primary font-semibold text-sm leading-tight">{value}</span>
      {sub && <span className="text-secondary text-xs">{sub}</span>}
      <span className="text-secondary text-xs">{label}</span>
    </div>
  )
}
