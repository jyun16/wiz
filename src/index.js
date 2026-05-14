import _ from 'lodash'
import jsObj from './jsobj.js'

export function d(...args) {
	console.log(...args.map(a => {
		if (isNull(a)) return null
		const type = a.constructor?.name
		const dump = [ 'Object', 'Array' ]
		return dump.includes(type) ? jsObj.dump(a) : a
	}))
}

export function dd(...args) { d(...args) }

export function callStack() {
	const ret = new Error().stack.split('at ')
	ret.shift()
	ret.shift()
	return ret.map(v => v.trim())
}

export function caller(depth = 0) {
	const stack = new Error().stack.split('at ')
	stack.shift()
	stack.shift()
	const target = stack[depth]
	let ret = /\(.+\)/.test(target) ? /\((.+)\)/.exec(target)[1] : target
	return ret.replace('\n', '').trim().replace(/:\d+$/, '')
}

export function json(x) { return JSON.stringify(x) }

export function parseJSON(x) { return JSON.parse(x) }

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

export function rand(min, max) {
	if (max === undefined) { max = min; min = 0 }
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function range(start, end, step = 1) {
  if (end === undefined) [start, end] = [0, start-1]
  const len = Math.floor((end - start) / step) + 1
  return Array.from({ length: len }, (_, i) => start + i * step)
}

export function deepClone(v) { return _.cloneDeep(v) }

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

export function isNumber(v) { return /^\d+$/.test(v) }

export function isMap(v) { return _.isMap(v) }

export function includes(t, v, i) { return _.includes(t, v, i) }

export function instanceName(o) { return o?.constructor?.name || typeof o }

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

export function trimDir(path, cd = '..') {
	const l = cd.match(/\./g).length
	for (let i = 1; i < l; i++) {
		path = path.replace(/[^\/]+$/, '')
		if (path != '/') { path = path.replace(/\/$/, '') }
	}
	return path
}

export * from './array.js'
export * from './string.js'
export * from './object.js'
export * from './date.js'
export * as calendar from './calendar.js'
export * as web from './web/utils.js'
export { default as ISA } from './isa.js'
export { jsObj }
export { default as validation } from './validation.js'
export { default as Validator } from './validator.js'
export { default as Form } from './web/form.js'
export { default as Role } from './role.js'
