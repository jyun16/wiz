import _ from 'lodash'
import { equal, isString, isObject, array2obj } from './index.js'

const splitPath = key => typeof key === 'string' ? key.replace(/\[(\w+)\]/g, '.$1').split('.') : key

export function objKeys(o) {
	return Object.keys(o || {})
}

export function objEntries(o) {
	return Object.entries(o || {})
}

export function objFromEntries(o) {
	return Object.fromEntries(o)
}

export function objClone(o) {
  return structuredClone(o)
}

export function objDeepFreeze(o = {}) {
	for (const v of Object.values(o)) {
		if (v && typeof v === 'object') objDeepFreeze(v)
	}
	return Object.freeze(o)
}

export function objPick(obj, keys) {
	return keys.reduce((res, k) => (k in obj && (res[k] = obj[k]), res), {})
}

export function objMap(o, fn) {
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, fn(v, k)]))
}

export function objFilter(obj, keys) {
	const res = { ...obj }
	for (const k of keys) delete res[k]
	return res
}

export function objRemoveEmpty(o) {
	const ret = { ...o }
	for (const k in ret) if (ret[k] == null || ret[k] === '') delete ret[k]
	return ret
}

export function objTrim(o) {
	for (const k in o) if (o[k] == null || o[k] === '') delete o[k]
	return o
}

export function objDeleteByVal(obj, value) {
	for (const k in obj) {
		if (obj[k] === value) {
			delete obj[k]
			return k
		}
	}
	return null
}

export function objOmit(obj, keys) {
	const ks = Array.isArray(keys) ? Object.fromEntries(keys.map(k => [k, true])) : { [keys]: true }
	return Object.fromEntries(Object.entries(obj).filter(([k]) => !ks[k]))
}

export function objFlatten(o, prefix = '') {
  return Object.entries(o).reduce((res, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(res, objFlatten(v, key))
    else res[key] = v
    return res
  }, {})
}

export function objCompact(o) {
  for (const k in o) {
    if (o[k] && typeof o[k] === 'object') objCompact(o[k])
    if (o[k] == null || o[k] === '') delete o[k]
  }
  return o
}

export function objMerge(target, ...sources) {
	for (const source of sources) {
		for (const k in source) {
			if (source[k] instanceof Object && !Array.isArray(source[k])) {
				Object.assign(target[k] || (target[k] = {}), objMerge(target[k] || {}, source[k]))
			}
			else {
				target[k] = source[k]
			}
		}
	}
	return target
}

export function objDiff(keys, obj, old) {
	const created = {}
	const changed = {}
	const removed = {}
	for (const path of keys) {
		const val = objGet(obj, path)
		const prev = objGet(old, path)
		if (val !== undefined && prev === undefined) {
			created[path] = val
		}
		else if (val === undefined && prev !== undefined) {
			removed[path] = prev
		}
		else if (!equal(val, prev)) {
			changed[path] = val
		}
	}
	return { created, changed, removed }
}

export function objSwap(map) {
	const ret = {}
	for (const k in map) ret[map[k]] = k
	return ret
}

export function objSortByVal(obj, desc = false) {
	const entries = Object.entries(obj)
	return Object.fromEntries(entries.sort(([, x], [, y]) => desc ? y - x : x - y))
}

export function objSortList(list, key) {
	return list.sort((a, b) => parseInt(a[key]) - parseInt(b[key]))
}

export function objSlice(a, offset, limit) {
	return Object.fromEntries(Object.entries(a).slice(offset, offset + limit))
}

export function objSliceVal(obj, key, start, end) {
	const arr = objGet(obj, key)
	if (!Array.isArray(arr)) throw new Error(`Value at "${key}" is not an array`)
	return arr.slice(start, end)
}

export function objSpliceVal(obj, key, start, deleteCount, ...items) {
	const arr = objGet(obj, key)
	if (!Array.isArray(arr)) throw new Error(`Value at "${key}" is not an array`)
	return arr.splice(start, deleteCount, ...items)
}

export function objMixin(target, mixins) {
	const arr = Array.isArray(mixins) ? mixins : [mixins]
	arr.forEach(m => {
		Object.keys(m).forEach(k => {
			if (typeof target.prototype[k] === 'function') target.prototype[`super_${k}`] = target.prototype[k]
		})
		Object.assign(target.prototype, m)
	})
}

// object access by path
export function objHas(obj, key) {
	const path = splitPath(key)
	let cur = obj
	for (const k of path) {
		if (cur == null || typeof cur !== 'object' || !(k in cur)) return false
		cur = cur[k]
	}
	return true
}

export function objGet(obj, key) {
	return splitPath(key).reduce((o, k) => (o || {})[k], obj)
}

export function objSet(obj, key, value) {
	const path = splitPath(key)
	let cur = obj
	for (let i = 0; i < path.length; i++) {
		const k = path[i]
		if (i === path.length - 1) {
			cur[k] = value
		}
		else {
			if (!(k in cur) || typeof cur[k] !== 'object') cur[k] = /^\d+$/.test(path[i + 1]) ? [] : {}
			cur = cur[k]
		}
	}
	return obj
}

export function objDelete(obj, key) {
	const path = splitPath(key)
	let cur = obj
	for (let i = 0; i < path.length - 1; i++) {
		const k = path[i]
		if (cur == null || typeof cur !== 'object' || !(k in cur)) return
		cur = cur[k]
	}
	delete cur[path[path.length - 1]]
}

function _objKeysDeep(ret, map, pk) {
	for (const k in map) {
		const v = map[k]
		const key = pk ? `${pk}.${k}` : k
		if (v && typeof v === 'object') _objKeysDeep(ret, v, key)
		else ret.push(key)
	}
}

export function objKeysDeep(map) {
	const ret = []
	_objKeysDeep(ret, map, '')
	return ret
}

export function objDumpJS(obj, tab = 0, opts = {}) {
	const o = objMerge({ quote: "'" }, opts)
	return `${'\t'.repeat(tab)}{${_objDumpJS(obj, ++tab, o).replace(/^{/, '')}`
}

function _objDumpJS(obj, tab, opts) {
	const dumpKey = k => /^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(k) ? k : `${opts.quote}${k}${opts.quote}`
	const dumpVal = v => {
		if (typeof v === 'string') return `${opts.quote}${v}${opts.quote}`
		if (Array.isArray(v)) return `[\n${v.map(val => `${'\t'.repeat(tab + 1)}${dumpVal(val)}`).join(',\n')}\n${'\t'.repeat(tab)}]`
		if (typeof v === 'object' && v !== null) return _objDumpJS(v, tab + 1, opts)
		return String(v)
	}
	const entries = Object.entries(obj).map(([k, v]) => `${'\t'.repeat(tab)}${dumpKey(k)}: ${dumpVal(v)}`)
	return `{\n${entries.join(',\n')}\n${'\t'.repeat(Math.max(tab - 1, 0))}}`
}

export function objAddCount(obj, key) {
	const r = {}
	if (!(key in obj)) {
		for (const k in obj) r[k] = obj[k] + 1
		r[key] = 0
		return r
	}
	if (obj[key] > 0) return obj
	r[key] = obj[key] + 1
	for (const k in obj) if (k !== key) r[k] = obj[k] <= r[key] ? 0 : obj[k]
	return objSortByVal(r, true)
}
