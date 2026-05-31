import { equal, isNull, isEmpty, isString, isObject, clone } from './index.js'

const splitPath = key => typeof key === 'string' ? key.replace(/\[(\w+)\]/g, '.$1').split('.') : key

export function objTrim(o) {
	for (const k in o) if (isEmpty(o[k])) delete o[k]
	return o
}

export function objTrimCopy(o) {
	const ret = {}
	for (const k in o) if (!isEmpty(o[k])) ret[k] = o[k]
	return ret
}

export function objTrimDeep(o) {
	for (const k in o) {
		if (isObject(o[k])) objTrimDeep(o[k])
		if (isEmpty(o[k])) delete o[k]
	}
	return o
}

export function objTrimDeepCopy(o) {
	return objTrimDeep(clone(o))
}

export function objCompact(o) {
	for (const k in o) if (isNull(o[k])) delete o[k]
	return o
}

export function objCompactCopy(o) {
	const ret = {}
	for (const k in o) if (!isNull(o[k])) ret[k] = o[k]
	return ret
}

export function objCompactDeep(o) {
	for (const k in o) {
		if (isObject(o[k])) objCompactDeep(o[k])
		if (isNull(o[k])) delete o[k]
	}
	return o
}

export function objCompactDeepCopy(o) {
	return objCompactDeep(clone(o))
}

export function objMap(o, fn) {
	const ret = {}
	for (const k in o) ret[k] = fn(k, o[k])
	return ret
}

export function objFilter(o, fn) {
	const ret = {}
	for (const k in o) if (fn(k, o[k])) ret[k] = o[k]
	return ret
}

export function objPick(o, keys) {
	const ret = {}
	if (isString(keys)) keys = keys.split(',')
	for (const k of keys) if (k in o) ret[k] = o[k]
	return ret
}

export function objOmit(o, keys) {
	const ks = Array.isArray(keys) ? Object.fromEntries(keys.map(k => [ k, true ])) : { [keys]: true }
	return Object.fromEntries(Object.entries(o).filter(([ k ]) => !ks[k]))
}

export function objOmitSelf(o, keys) {
	for (const k of Array.isArray(keys) ? keys : [ keys ]) delete o[k]
	return o
}

export function objDelete(o, key) {
	if (isString(key) && /[.[\]]/.test(key)) return objDeletePath(o, key)
	delete o[key]
	return o
}

export function objDeleteByVal(o, value) {
	for (const k in o) {
		if (o[k] === value) {
			delete o[k]
			return k
		}
	}
	return null
}

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

export function objFlatten(o, prefix = '') {
	return Object.entries(o).reduce((res, [k, v]) => {
		const key = prefix ? `${prefix}.${k}` : k
		if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(res, objFlatten(v, key))
		else res[key] = v
		return res
	}, {})
}

export function objMerge(target, ...sources) {
	for (const source of sources) {
		for (const k in source) {
			if (isObject(source[k])) {
				Object.assign(target[k] || (target[k] = {}), objMerge(target[k] || {}, source[k]))
			}
			else {
				target[k] = source[k]
			}
		}
	}
	return target
}

export function objMergeCopy(target, ...sources) {
	return objMerge(clone(target), ...sources)
}

export function objDiff(keys, o, old) {
	const created = {}
	const changed = {}
	const removed = {}
	for (const path of keys) {
		const val = objGet(o, path)
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

export function objSortByVal(o, desc = false) {
	const entries = Object.entries(o)
	return Object.fromEntries(entries.sort(([, x], [, y]) => desc ? y - x : x - y))
}

export function objSortList(list, key) {
	return list.sort((a, b) => parseInt(a[key]) - parseInt(b[key]))
}

export function objSlice(a, offset, limit) {
	return Object.fromEntries(Object.entries(a).slice(offset, offset + limit))
}

export function objSliceVal(o, key, start, end) {
	const arr = objGet(o, key)
	if (!Array.isArray(arr)) throw new Error(`Value at "${key}" is not an array`)
	return arr.slice(start, end)
}

export function objSpliceVal(o, key, start, deleteCount, ...items) {
	const arr = objGet(o, key)
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
export function objHas(o, key) {
	const path = splitPath(key)
	let cur = o
	for (const k of path) {
		if (cur == null || typeof cur !== 'object' || !(k in cur)) return false
		cur = cur[k]
	}
	return true
}

export function objGet(o, key) {
	return splitPath(key).reduce((o, k) => (o || {})[k], o)
}

export function objSet(o, key, value) {
	const path = splitPath(key)
	let cur = o
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
	return o
}

export function objDeletePath(o, key) {
	const path = splitPath(key)
	let cur = o
	for (let i = 0; i < path.length - 1; i++) {
		const k = path[i]
		if (cur == null || typeof cur !== 'object' || !(k in cur)) return o
		cur = cur[k]
	}
	delete cur[path[path.length - 1]]
	return o
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

export function objDumpJS(o, tab = 0, opts = {}) {
	const _o = objMerge({ quote: "'" }, opts)
	return `${'\t'.repeat(tab)}{${_objDumpJS(o, tab + 1, _o).replace(/^{/, '')}`
}

function _objDumpJS(o, tab, opts) {
	const dumpKey = k => /^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(k) ? k : `${opts.quote}${k}${opts.quote}`
	const dumpVal = v => {
		if (typeof v === 'string') return `${opts.quote}${v}${opts.quote}`
		if (Array.isArray(v)) return `[\n${v.map(val => `${'\t'.repeat(tab + 1)}${dumpVal(val)}`).join(',\n')}\n${'\t'.repeat(tab)}]`
		if (typeof v === 'object' && v !== null) return _objDumpJS(v, tab + 1, opts)
		return String(v)
	}
	const entries = Object.entries(o).map(([k, v]) => `${'\t'.repeat(tab)}${dumpKey(k)}: ${dumpVal(v)}`)
	return `{\n${entries.join(',\n')}\n${'\t'.repeat(Math.max(tab - 1, 0))}}`
}

export function objAddCount(o, key) {
	const r = {}
	if (!(key in o)) {
		for (const k in o) r[k] = o[k] + 1
		r[key] = 0
		return r
	}
	if (o[key] > 0) return o
	r[key] = o[key] + 1
	for (const k in o) if (k !== key) r[k] = o[k] <= r[key] ? 0 : o[k]
	return objSortByVal(r, true)
}
