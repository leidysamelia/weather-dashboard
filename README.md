# 🌤 Weather Dashboard

Aplicación web responsiva y minimalista para consultar el clima en tiempo real de cualquier ciudad del mundo. Construida con **React + Vite + Tailwind CSS**, sin necesidad de API key.

---

## ✨ Características

- **Búsqueda inteligente** — acepta inputs en español o inglés (`"Madrid, España"`, `"New York, US"`, `"Tokio"`)
- **Sin API key** — consume [Open-Meteo](https://open-meteo.com/) (gratuito, sin registro)
- **Temas dinámicos** — la interfaz cambia de colores según el estado del clima: ☀️ soleado, 🌧️ lluvia, ⛈️ tormenta, ❄️ nieve, 🌫️ niebla, 🌙 noche
- **Datos en tiempo real** — temperatura, sensación térmica, humedad, viento, presión, visibilidad, nubosidad, mín/máx del día
- **Arquitectura modular** — lógica de negocio separada de la UI mediante una capa de servicios
- **63 pruebas unitarias** con Jest y reporte HTML generado automáticamente

---

## 🖥️ Demo

🔗 **[leidysamelia.github.io/weather-dashboard](https://leidysamelia.github.io/weather-dashboard/)**

| Soleado | Lluvia | Tormenta |
|:---:|:---:|:---:|
| Tema naranja cálido | Tema azul frío | Tema morado oscuro |

---

## 🚀 Inicio rápido

### Prerrequisitos

- Node.js 18+
- npm 9+

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/weather-dashboard.git
cd weather-dashboard

# Instalar dependencias
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en el navegador.

### Producción

```bash
# Generar build estática
npm run build

# Previsualizar la build
npm run preview
```

La carpeta `dist/` contiene la app lista para desplegar en cualquier hosting estático (Netlify, Vercel, GitHub Pages).

---

## 🧪 Pruebas

```bash
# Correr las 63 pruebas unitarias
npm test

# Modo watch (re-ejecuta al guardar)
npm run test:watch

# Generar reporte HTML de negocio en reports/business-report.html
npm run test:report

# Cobertura de código
npm run test:coverage
```

El comando `npm test` genera automáticamente `reports/test-report.html` con el resultado visual de todas las pruebas.

---

## 📁 Estructura del proyecto

```
weather-dashboard/
├── index.html
├── vite.config.js
├── jest.config.cjs              # Configuración de Jest
├── babel.config.cjs             # Transpilación para Jest
│
├── src/
│   ├── main.jsx
│   ├── index.css                # CSS variables por tema climático
│   ├── App.jsx                  # Componente raíz + gestión de temas
│   │
│   ├── services/                # Lógica de negocio (testeables, sin UI)
│   │   ├── weatherService.js    # Llamadas a Open-Meteo (geocodificación + forecast)
│   │   └── weatherTransform.js  # Normalización, validación y formato de datos
│   │
│   ├── hooks/
│   │   └── useWeather.js        # Estado de React que orquesta los servicios
│   │
│   ├── utils/
│   │   ├── weatherTheme.js      # Mapeo de códigos WMO → temas e iconos
│   │   └── parseLocation.js     # Parser ES/EN de nombres de ciudad y país
│   │
│   └── components/
│       ├── SearchBar.jsx        # Input de búsqueda con sugerencias
│       ├── WeatherCard.jsx      # Tarjeta principal de datos del clima
│       ├── ErrorMessage.jsx     # Manejo visual de errores
│       └── EmptyState.jsx       # Estado inicial sin búsqueda
│
├── __tests__/                   # Pruebas unitarias (espejo de src/)
│   ├── services/
│   │   └── weatherTransform.test.js   # 31 pruebas
│   └── utils/
│       ├── parseLocation.test.js      # 10 pruebas
│       └── weatherTheme.test.js       # 23 pruebas (15 temas + 8 iconos)
│
├── scripts/
│   └── generate-report.js       # Generador de reporte HTML de negocio
│
└── reports/                     # Reportes generados (ignorados por git)
    ├── test-report.html         # Reporte técnico (jest-html-reporters)
    └── business-report.html     # Reporte orientado al negocio
```

---

## 🏗️ Arquitectura

La app sigue una separación estricta en tres capas:

```
UI (components/)
     ↓ estado
Hooks (hooks/)
     ↓ llamadas puras
Services (services/)
     ↓ fetch
APIs externas (Open-Meteo)
```

**`services/weatherTransform.js`** — Funciones puras sin efectos secundarios: normalizan la respuesta de la API, validan el input del usuario, formatean unidades. Al ser puras, son 100% testeables sin mocks de red.

**`services/weatherService.js`** — Encapsula toda comunicación con Open-Meteo. Cambiar de proveedor de datos no requiere tocar ningún componente de UI.

### Sistema de temas dinámicos

Los colores de la interfaz cambian mediante CSS custom properties en el elemento `<html>`:

```js
// App.jsx — escribe el atributo data-theme según el código WMO recibido
document.documentElement.setAttribute('data-theme', 'rainy')
```

```css
/* index.css — cada tema redefine las mismas variables */
[data-theme="rainy"] {
  --gradient-from: #1a365d;
  --accent: #63b3ed;
  /* ... */
}
```

Los **7 temas** disponibles son: `sunny` · `cloudy` · `rainy` · `stormy` · `snowy` · `foggy` · `night`, todos con transición de 0.5s.

---

## 🌐 API utilizada

| Endpoint | Propósito |
|---|---|
| `geocoding-api.open-meteo.com/v1/search` | Resuelve nombre de ciudad a coordenadas |
| `api.open-meteo.com/v1/forecast` | Obtiene condiciones climáticas actuales y mín/máx del día |

- **Sin API key** — completamente gratuito
- **Sin límite de llamadas** documentado
- Códigos de condición según el estándar **WMO** (World Meteorological Organization)

---

## 🧩 Stack técnico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | UI reactiva |
| Vite | 8 | Build tool y dev server |
| Tailwind CSS | 4 | Estilos utilitarios |
| Jest | 30 | Pruebas unitarias |
| Babel | 8 | Transpilación JSX para Jest |
| jest-html-reporters | 3 | Reporte HTML de pruebas |

---

## 📋 Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en localhost:5173 |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Previsualiza la build en localhost:4173 |
| `npm test` | Ejecuta las 63 pruebas + genera reporte HTML |
| `npm run test:watch` | Pruebas en modo interactivo |
| `npm run test:report` | Genera `reports/business-report.html` |
| `npm run test:coverage` | Cobertura de código por módulo |

---

## 📄 Licencia

ISC — libre para uso académico y personal.
