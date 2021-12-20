const esbuild = require('esbuild')
const process = require('process')
const moment = require('moment')
const childprocess = require('child_process')
const chalk = require('chalk')

const argv = process.argv.slice(2)
const argm = {}
argv.forEach((arg) => argm[arg] = true)

const watch = argm['-w'] || false

const originEnv = { ...process.env }
require('dotenv').config()
const define = {}

for (const key in process.env) {
  if (originEnv[key]) {
    continue
  }
  define[`process.env.${key}`] = JSON.stringify(process.env[key] || '')
}

const processManager = {
  child: null,
  endChild() {
    this.child?.kill()
    this.child = null
  },
  startChild() {
    this.endChild()

    const child = this.child = childprocess.spawn('node', ['dist/main'])
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
    console.log(chalk.blueBright`[Builder] Server (re)start ${new Date}`)
  },
}

if (watch) {
  processManager.startChild()
}
esbuild.build({
  entryPoints: ['src/main.ts'],
  platform: 'node',

  define,

  watch: watch && {
    onRebuild() {
      console.log(chalk.blueBright`[Builder] BE Rebuild ${new Date}`)
      processManager.startChild()
    },
  },
  bundle: true,
  minify: !watch,
  sourcemap: watch? 'both': false,
  outdir: 'dist',
  tsconfig: 'tsconfig.json',
})
