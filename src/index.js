import _ from 'lodash'

export const d = (...args) => console.dir(args.length === 1 ? args[0] : args, { depth: null })
export const dd = (...args) => console.dir(args.length === 1 ? args[0] : args, { depth: null })

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

export function range(...args) { return _.range(...args) }

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
export { default as jsObj } from './jsobj.js'
export { default as validation } from './validation.js'
export { default as Validator } from './validator.js'
export { default as Form } from './web/form.js'
export { default as Role } from './role.js'
