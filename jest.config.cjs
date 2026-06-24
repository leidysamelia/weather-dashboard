module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testMatch: ['**/__tests__/**/*.test.{js,jsx}'],
  verbose: true,

  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './reports',
        filename: 'test-report.html',
        expand: true,
        pageTitle: 'Weather Dashboard — Reporte de Pruebas Unitarias',
        hideIcon: false,
        testCommand: 'npm test',
        openReport: false,
        failureMessageOnly: false,
        includeFailureMsg: true,
        includeSuiteFailure: true,
      },
    ],
  ],
}
