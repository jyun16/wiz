import _ from 'lodash'
import util from 'util'
import { fileURLToPath } from 'url'
import colors from 'colors'

const colorMap = {
	R: 'red',
	G: 'green',
	B: 'blue',
	Y: 'yellow',
	M: 'magenta',
	C: 'cyan',
	W: 'white',
}

export function die(...a) {
	pr(...a)
	process.exit()
}

export function diep(...a) {
	p(...a)
	process.exit()
}

export function json(x) { return JSON.stringify(x) }
export function parseJson(x) { return JSON.parse(x) }

export function equal(v1, v2) { return _.isEqual(v1, v2) }

export function compare(v1, ope, v2) {
	v1 = Number(v1)
	v2 = Number(v2)
	if (ope == '<') { return v1 < v2 }
	else if (ope == '<=') { return v1 <= v2 }
	else if (ope == '>') { return v1 > v2 }
	else if (ope == '>=') { return v1 >= v2 }
	else if (ope == '==') { return v1 == v2 }
	else if (ope == '!=') { return v1 != v2 }
}

export function clone(v) { return _.cloneDeep(v) }
export function isNull(v) {
	if (v == null || v == undefined) { return true }
	return false
}
export function isEmpty(v) {
	if (v == null) return true
	if (typeof v == 'string' || Array.isArray(v)) return v.length == 0
	if (typeof v == 'object') return Object.keys(v).length == 0
	return false
}
export function isString(v) { return _.isString(v) }
export function isArray(v) { return _.isArray(v) }
export function isObject(v) { return _.isPlainObject(v) }
export function isInstance(v) { return(!!v) && v.constructor === Object }
export function isMap(v) { return _.isMap(v) }
export function includes(t, v, i) { return _.includes(t, v, i) }
export function range(...args) { return _.range(...args) }

export function expandRange(r) {
	return r.split(',').flatMap(s => {
		const t = s.trim()
		const m = t.match(/^(\d+)\.\.(\d+)$/)
		if (m) {
			const res = []
			for (let i = parseInt(m[1]); i <= parseInt(m[2]); i++) res.push(i)
			return res
		}
		return parseInt(t)
	})
}

export function isMain(url) {
	if (typeof process != 'undefined') {
		return process.argv[1] === fileURLToPath(url)
	}
}

export function define(name, value) {
	Object.defineProperty(global, name, { value:value, writable:false, configurable:false })
}

export function usleep(msec) {
	return new Promise((resolve, reject) => {
		setTimeout(function() { resolve() }, msec)
	})
}

export function sleep(sec) {
	return new Promise((resolve, reject) => {
		setTimeout(function() { resolve() }, sec * 1000)
	})
}

export * from './array.js'
export * from './string.js'
export * from './object.js'
export * from './date.js'

if (isMain(import.meta.url)) {
	const isEmptyTest = t => {
		t.true(isNull(null))
		t.true(isNull(undefined))
		t.true(isNull())
		t.true(isEmpty({}))
		t.true(isEmpty([]))
		t.true(isEmpty(null))
		t.true(isEmpty(''))
		t.false(isEmpty('0'))
		t.false(isEmpty({ hoge: 'HOGE' }))
		t.false(isEmpty([ '' ]))
		t.false(isEmpty(0))
		t.false(isEmpty(10))
	}
	(async () => {
		const Test = (await import('./test.js')).default
		const t = new Test()

		t.eq(range(1, 10, 2), [ 1, 3, 5, 7, 9 ])
		t.eq(includes(range(0, 3, 2), 2), true)
		isEmptyTest(t)
		t.eq([ 1, 2, 3 ], expandRange('1..3'))
		t.eq([ 1, 2, 3, 5, 8, 9, 10 ], expandRange('1..3, 5, 8..10'))

//    p(`WHITE ^RRED ^GGREEN ^BBLUE ^YYELLOW ^MMAGENTA ^CCYAN ^WWHITE ^^W ^GGREEN`)
//    pr('hoge', { hoge: 'HOGE' })
//    pr({ hoge: 'HOGE' })
//    cl(codePoint2Char('U+1F923'))
//    cl(codePoint2Char(0x1F923))
//    cl(char2CodePoint('🤣'))
//    cl(randStrTough())
//    cl(tab2sp(removeIndent(`
//    export function deepFreeze(o = {}) {
//      for (const [ k, v ] of Object.entries(o)) {
//        if (v && typeof v == 'object') {
//          deepFreeze(v)
//        }
//      }
//      return Object.freeze(o)
//    }
//    `)))
	})()
}
