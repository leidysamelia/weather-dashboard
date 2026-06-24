export default function ErrorMessage({ message }) {
  return (
    <div
      className="weather-card p-6 w-full max-w-xl mx-auto text-center"
      role="alert"
    >
      <span className="text-4xl block mb-3">🔍</span>
      <h3 className="font-semibold text-primary mb-2">No se pudo obtener el clima</h3>
      <p className="text-secondary text-sm leading-relaxed">{message}</p>
      <p className="text-secondary text-xs mt-4 opacity-60">
        Ejemplos: "Madrid, España" · "New York, US" · "Bogotá, CO"
      </p>
    </div>
  )
}
