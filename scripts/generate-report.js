#!/usr/bin/env node
/**
 * generate-report.js
 *
 * Lee el JSON de resultados de Jest (reports/jest-results.json) y genera
 * un reporte HTML semántico orientado al negocio, no solo al log técnico.
 *
 * Uso:  node scripts/generate-report.js
 * Pre:  jest --json --outputFile=reports/jest-results.json debe haber corrido antes.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const INPUT = resolve(ROOT, 'reports', 'jest-results.json')
const OUTPUT = resolve(ROOT, 'public', 'reports', 'business-report.html')

// ─── Metadatos de negocio por suite ──────────────────────────────────────────
// Asocia el nombre del archivo de test con descripción de negocio y área.
const SUITE_META = {
  'weatherTransform.test.js': {
    area: 'Capa de Transformación de Datos',
    purpose:
      'Valida que los datos crudos de Open-Meteo se normalizan correctamente antes de ' +
      'llegar a la UI. Un fallo aquí provocaría temperaturas incorrectas, iconos erróneos ' +
      'o textos confusos para el usuario final.',
    risk: 'Alto',
  },
  'parseLocation.test.js': {
    area: 'Interpretación de Búsqueda del Usuario',
    purpose:
      'Garantiza que el parser entiende inputs en español e inglés y los convierte ' +
      'al formato que espera la API de geocodificación, maximizando el éxito de cada búsqueda.',
    risk: 'Alto',
  },
  'weatherTheme.test.js': {
    area: 'Sistema de Temas Visuales',
    purpose:
      'Verifica que cada condición climática activa el esquema de colores correcto (sunny, ' +
      'rainy, stormy, etc.) y que el icono emoji asociado es el apropiado. ' +
      'Un fallo rompería la identidad visual dinámica de la aplicación.',
    risk: 'Medio',
  },
}

const RISK_COLOR = { Alto: '#ef4444', Medio: '#f59e0b', Bajo: '#22c55e' }

// ─── Utilidades ──────────────────────────────────────────────────────────────

function basename(filePath) {
  return filePath.split(/[\\/]/).pop()
}

function statusBadge(status) {
  const map = {
    passed: ['✓', '#22c55e', '#f0fdf4'],
    failed: ['✗', '#ef4444', '#fef2f2'],
    pending: ['○', '#94a3b8', '#f8fafc'],
    todo: ['◌', '#94a3b8', '#f8fafc'],
  }
  const [icon, color, bg] = map[status] ?? ['?', '#94a3b8', '#f8fafc']
  return `<span class="badge" style="color:${color};background:${bg};border:1px solid ${color}30">${icon} ${status}</span>`
}

function duration(ms) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`
}

// ─── Construcción del HTML ────────────────────────────────────────────────────

// Normaliza diferencias de schema entre versiones de Jest
function normalizeSuite(s) {
  return {
    testFilePath: s.testFilePath ?? s.name,
    status: s.status,
    testResults: s.testResults ?? s.assertionResults ?? [],
    startTime: s.perfStats?.start ?? s.startTime,
    endTime: s.perfStats?.end ?? s.endTime,
  }
}

function buildReport(json) {
  const now = new Date().toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'short',
  })

  const totalSuites = json.numTotalTestSuites
  const passedSuites = json.numPassedTestSuites
  const totalTests = json.numTotalTests
  const passedTests = json.numPassedTests
  const failedTests = json.numFailedTests
  const overallPassed = json.success

  const globalColor = overallPassed ? '#22c55e' : '#ef4444'
  const globalLabel = overallPassed ? '✓ TODAS LAS PRUEBAS PASARON' : '✗ HAY PRUEBAS FALLIDAS'

  const suitesHtml = json.testResults
    .map((rawSuite) => {
      const suite = normalizeSuite(rawSuite)
      const file = basename(suite.testFilePath)
      const meta = SUITE_META[file] ?? {
        area: file,
        purpose: 'Sin descripción de negocio disponible.',
        risk: 'Bajo',
      }
      const suitePass = suite.status === 'passed'
      const riskColor = RISK_COLOR[meta.risk] ?? '#94a3b8'

      const testsHtml = suite.testResults
        .map((t) => {
          const ancestors = t.ancestorTitles.join(' › ')
          const failures = t.failureMessages
            .map((m) => `<pre class="failure-msg">${escapeHtml(m)}</pre>`)
            .join('')
          return `
          <tr class="test-row ${t.status}">
            <td class="test-status">${statusBadge(t.status)}</td>
            <td class="test-name">
              ${ancestors ? `<span class="ancestor">${escapeHtml(ancestors)}</span> › ` : ''}
              ${escapeHtml(t.title)}
            </td>
            <td class="test-duration">${duration(t.duration ?? 0)}</td>
          </tr>
          ${failures ? `<tr><td colspan="3">${failures}</td></tr>` : ''}`
        })
        .join('')

      return `
      <section class="suite ${suitePass ? 'suite-pass' : 'suite-fail'}">
        <div class="suite-header">
          <div class="suite-title">
            <span class="suite-status-dot" style="background:${suitePass ? '#22c55e' : '#ef4444'}"></span>
            <h2>${escapeHtml(meta.area)}</h2>
            <code class="file-name">${file}</code>
          </div>
          <span class="risk-badge" style="border-color:${riskColor};color:${riskColor}">
            Riesgo ${meta.risk}
          </span>
        </div>

        <div class="business-box">
          <span class="business-label">📋 Propósito de negocio</span>
          <p>${escapeHtml(meta.purpose)}</p>
        </div>

        <div class="suite-stats">
          <span>${suite.testResults.filter((t) => t.status === 'passed').length} pasaron</span>
          <span>${suite.testResults.filter((t) => t.status === 'failed').length} fallaron</span>
          <span>${duration(suite.endTime - suite.startTime)}</span>
        </div>

        <table class="tests-table">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Prueba</th>
              <th>Tiempo</th>
            </tr>
          </thead>
          <tbody>${testsHtml}</tbody>
        </table>
      </section>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weather Dashboard — Reporte de Pruebas Unitarias</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
    }
    a { color: inherit; text-decoration: none; }

    .top-bar {
      background: linear-gradient(135deg, #1e293b, #334155);
      color: #fff;
      padding: 2rem;
      text-align: center;
    }
    .top-bar h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: .25rem; }
    .top-bar .subtitle { opacity: .7; font-size: .9rem; }
    .top-bar .generated { opacity: .5; font-size: .8rem; margin-top: .5rem; }

    .overall-banner {
      padding: 1rem 2rem;
      font-weight: 700;
      font-size: 1.1rem;
      text-align: center;
      color: ${globalColor};
      background: ${overallPassed ? '#f0fdf4' : '#fef2f2'};
      border-bottom: 2px solid ${globalColor}40;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      padding: 1.5rem 2rem;
      max-width: 900px;
      margin: 0 auto;
    }
    .summary-card {
      background: #fff;
      border-radius: .75rem;
      padding: 1rem;
      text-align: center;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
      border: 1px solid #e2e8f0;
    }
    .summary-card .value { font-size: 2rem; font-weight: 700; }
    .summary-card .label { font-size: .75rem; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }

    .suites-wrapper { max-width: 900px; margin: 0 auto; padding: 0 2rem 3rem; }

    .suite {
      background: #fff;
      border-radius: 1rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 4px rgba(0,0,0,.08);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .suite-pass { border-left: 4px solid #22c55e; }
    .suite-fail { border-left: 4px solid #ef4444; }

    .suite-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      flex-wrap: wrap;
      gap: .5rem;
    }
    .suite-title { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
    .suite-title h2 { font-size: 1.05rem; font-weight: 600; }
    .suite-status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .file-name {
      font-size: .75rem;
      background: #f1f5f9;
      padding: .15rem .5rem;
      border-radius: .375rem;
      color: #475569;
    }
    .risk-badge {
      font-size: .72rem;
      font-weight: 600;
      border: 1.5px solid;
      border-radius: 999px;
      padding: .2rem .65rem;
    }

    .business-box {
      margin: 1rem 1.5rem;
      padding: .875rem 1rem;
      background: #f8fafc;
      border-radius: .625rem;
      border-left: 3px solid #6366f1;
    }
    .business-label { font-size: .72rem; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: .06em; display: block; margin-bottom: .25rem; }
    .business-box p { font-size: .875rem; color: #475569; }

    .suite-stats {
      display: flex;
      gap: 1.5rem;
      padding: .5rem 1.5rem;
      font-size: .8rem;
      color: #64748b;
      border-bottom: 1px solid #f1f5f9;
    }
    .suite-stats span::before { content: '· '; }
    .suite-stats span:first-child::before { content: ''; }

    .tests-table { width: 100%; border-collapse: collapse; }
    .tests-table th {
      background: #f8fafc;
      padding: .6rem 1rem;
      font-size: .75rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: .05em;
      text-align: left;
      border-bottom: 1px solid #f1f5f9;
    }
    .test-row td {
      padding: .625rem 1rem;
      border-bottom: 1px solid #f8fafc;
      font-size: .875rem;
      vertical-align: top;
    }
    .test-row:last-child td { border-bottom: none; }
    .test-row.failed { background: #fff8f8; }
    .test-row.passed:hover { background: #f8fafc; }
    .test-status { width: 110px; }
    .test-duration { width: 70px; color: #94a3b8; font-size: .8rem; }
    .ancestor { color: #94a3b8; font-size: .8rem; }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: .25rem;
      padding: .2rem .55rem;
      border-radius: 999px;
      font-size: .75rem;
      font-weight: 600;
    }

    .failure-msg {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: .5rem;
      padding: .75rem;
      font-size: .78rem;
      color: #b91c1c;
      white-space: pre-wrap;
      word-break: break-word;
      margin: .25rem .5rem .5rem;
    }

    footer {
      text-align: center;
      padding: 1.5rem;
      font-size: .8rem;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>

  <div class="top-bar">
    <h1>🌤 Weather Dashboard</h1>
    <div class="subtitle">Reporte de Pruebas Unitarias</div>
    <div class="generated">Generado el ${now}</div>
  </div>

  <div class="overall-banner">${globalLabel}</div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="value" style="color:#6366f1">${totalTests}</div>
      <div class="label">Total pruebas</div>
    </div>
    <div class="summary-card">
      <div class="value" style="color:#22c55e">${passedTests}</div>
      <div class="label">Pasaron</div>
    </div>
    <div class="summary-card">
      <div class="value" style="color:${failedTests > 0 ? '#ef4444' : '#22c55e'}">${failedTests}</div>
      <div class="label">Fallaron</div>
    </div>
    <div class="summary-card">
      <div class="value" style="color:#6366f1">${totalSuites}</div>
      <div class="label">Suites</div>
    </div>
    <div class="summary-card">
      <div class="value" style="color:#22c55e">${passedSuites}</div>
      <div class="label">Suites OK</div>
    </div>
    <div class="summary-card">
      <div class="value" style="color:#64748b">${duration(json.testResults.reduce((s, r) => s + ((r.perfStats?.end ?? r.endTime) - (r.perfStats?.start ?? r.startTime)), 0))}</div>
      <div class="label">Tiempo total</div>
    </div>
  </div>

  <div class="suites-wrapper">
    <h2 style="font-size:1rem;color:#64748b;margin-bottom:1rem;font-weight:500">
      Resultados por módulo de negocio
    </h2>
    ${suitesHtml}
  </div>

  <footer>
    Generado por <strong>scripts/generate-report.js</strong> · Weather Dashboard © ${new Date().getFullYear()}
  </footer>

</body>
</html>`
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

try {
  const raw = readFileSync(INPUT, 'utf8')
  const json = JSON.parse(raw)
  mkdirSync(resolve(ROOT, 'reports'), { recursive: true })
  const html = buildReport(json)
  writeFileSync(OUTPUT, html, 'utf8')
  console.log(`✓ Reporte HTML generado en: ${OUTPUT}`)
} catch (err) {
  if (err.code === 'ENOENT') {
    console.error(`✗ No se encontró ${INPUT}`)
    console.error('  Ejecuta primero: npm run test:json')
  } else {
    console.error('✗ Error generando el reporte:', err.message)
  }
  process.exit(1)
}
