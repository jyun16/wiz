import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { series, parallel, watch, src, dest, lastRun } from 'gulp'
import _browserSync from 'browser-sync'
import plumber from 'gulp-plumber'
import rename from 'gulp-rename'
import pug from 'gulp-pug'
import esbuild from 'gulp-esbuild'

const SOURCE_MAP = `SM=1`

const d = console.log
const make = process.platform === 'freebsd' ? 'gmake' : 'make'

const wizw = () => { watch('src/**/*.js', series(wizc)) }
const wizc = (cb) => {
	d(execSync(`${make} wiz ${SOURCE_MAP}`).toString())
	cb()
}

export default parallel(wizw)
