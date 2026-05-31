import { execSync } from 'child_process'
import { series, parallel, watch, src } from 'gulp'
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
