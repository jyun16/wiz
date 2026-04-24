import _ from 'lodash'
import { range } from './index.js'

export function removeArray(a, v) { return _.pull(a, v) }
export function choice(a) { return _.sample(a) }
export function rand(...args) { return _.random(...args) }
export function concat(a1, a2) { return _.concat(a1, a2) } 
export function uniq(v) { return _.uniq(v) }

export function array2obj(a) {
	const ret = {}
	for (const v of a) { ret[v] = true }
	return ret
}

export function arrayMove(a, from, to) {
	a.splice(to, 0, a.splice(from, 1)[0])
	return a
}

export function reduceArray(a, offset, limit) {
	return a.slice(offset, offset + limit)
}

export function splitArray(arr, num) {
	const ret = []
	let tmp = []
	for (let i = 0; i < num; i++) { ret.push([]) }
	for (let i = 0; i < arr.length; i++) {
		ret[i % num].push(arr[i])
	}
	return ret
}

export function trimAll(a) {
	a.map(v => v.trim())
}

export function arrayDiff(a1, a2) {
	const added = {}
	const removed = {}
	for (const v of a1) { removed[v] = v }
	for (const v of a2) { added[v] = v }
	for (const v of a1) { delete added[v] }
	for (const v of a2) { delete removed[v] }
	return { added: Object.values(added), removed: Object.values(removed) }
}

export function arrayable(that) {
	return new Proxy(that, {
		get(self, prop) {
			if (!isNaN(prop)) return self.list[prop]
			else if (prop == 'length') return self.list.length
			return self[prop]
		},
		set(self, prop, value) {
			if (!isNaN(prop)) {
				self.list[Number(prop)] = value
				return true
			}
			self[prop] = value
			return true
		}
	})
}
