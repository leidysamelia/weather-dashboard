export default function EmptyState() {
  return (
    <div className="text-center py-12 animate-fade-in">
      <span className="text-7xl block mb-4">🌍</span>
      <h2 className="text-2xl font-semibold text-primary mb-2">
        ¿Cómo está el clima hoy?
      </h2>
      <p className="text-secondary text-sm max-w-xs mx-auto leading-relaxed">
        Busca cualquier ciudad del mundo. Puedes escribir en español o inglés.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {['Madrid, España', 'Buenos Aires', 'Tokyo', 'New York, US'].map((ex) => (
          <span
            key={ex}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{
              background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            {ex}
          </span>
        ))}
      </div>
    </div>
  )
}
