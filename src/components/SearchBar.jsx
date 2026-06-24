import { useState } from 'react'

const SUGGESTIONS = [
  'Madrid, España',
  'Bogotá, Colombia',
  'Buenos Aires, Argentina',
  'Ciudad de México, México',
  'New York, US',
  'London, UK',
  'Tokyo, Japan',
  'París, Francia',
]

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) onSearch(query)
  }

  const handleSuggestion = (s) => {
    setQuery(s)
    setFocused(false)
    onSearch(s)
  }

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          className="search-input flex-1 px-5 py-3.5 rounded-2xl text-sm font-medium"
          placeholder="Ciudad, País o Ciudad, Estado..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          disabled={loading}
          autoComplete="off"
        />
        <button
          type="submit"
          className="search-btn px-6 py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Buscando...
            </span>
          ) : (
            'Buscar'
          )}
        </button>
      </form>

      {focused && !loading && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-10"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-secondary opacity-70">
            Sugerencias
          </p>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-primary)' }}
              onMouseDown={() => handleSuggestion(s)}
            >
              📍 {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )
}
