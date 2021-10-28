const esbuild = require('esbuild')
const process = require('process')
const moment = require('moment')

const argv = process.argv.slice(2)
const argm = {}
argv.forEach((arg) => argm[arg] = true)

const watch = (argm['-w'] || false) && {
  onRebuild() {
    console.log(`Rebuilded, ${moment().format('HH:mm:ss')}`)
  },
}

const originEnv = { ...process.env }
require('dotenv').config()
const define = {}

for (const key in process.env) {
  if (originEnv[key]) {
    continue
  }
  define[`process.env.${key}`] = JSON.stringify(process.env[key] || '')
}

esbuild.build({
  entryPoints: ['src/main.ts'],
  platform: 'node',

  define,

  watch,
  bundle: true,
  minify: !watch,
  sourcemap: watch? 'both': false,
  outdir: 'dist',
  tsconfig: 'tsconfig.json',
})
  .then(() => console.log('Build success.'))
  .catch((err) => console.error('Build error:', err.message))
