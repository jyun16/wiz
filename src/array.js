export function array2obj(a) {
	return Object.fromEntries(a.map(v => [v, true]))
}

export function arrayUniq(v) {
	return [...new Set(v)]
}

export function arrayConcat(a1, a2) {
	return [...a1, ...a2]
}

export function arrayRange(start, end, step = 1) {
	return Array.from({ length: Math.floor((end - start) / step) + 1 }, (_, i) => start + i * step)
}

export function arrayChoice(a) {
  return a[Math.floor(Math.random() * a.length)]
}

export function arrayPick(a, key) {
	return a.map(v => v[key])
}

export function arrayTrim(a) {
	return a.map(v => v.trim())
}

export function arrayKeyBy(a, key) {
	return Object.fromEntries(a.map(v => [v[key], v]))
}

export function arrayMove(a, from, to) {
	a.splice(to, 0, a.splice(from, 1)[0])
	return a
}

export function arrayRemove(a, v) {
	const i = a.indexOf(v)
	if (i !== -1) a.splice(i, 1)
	return a
}

export function arrayWrap(v) {
	return Array.isArray(v) ? v : [v]
}

export function arraySlice(a, offset, limit) {
	return a.slice(offset, offset + limit)
}

export function arrayChunk(a, size) {
	return Array.from({ length: Math.ceil(a.length / size) }, (_, i) => a.slice(i * size, i * size + size))
}

export function arraySplit(a, fn) {
	const ret = [[]]
	for (const v of a) {
		if (fn(v)) {
			ret.push([])
			continue
		}
		ret[ret.length - 1].push(v)
	}
	return ret
}

export function arrayDistribute(a, num) {
	const ret = Array.from({ length: num }, () => [])
	a.forEach((v, i) => ret[i % num].push(v))
	return ret
}

export function arrayDiff(a1, a2) {
	const s1 = new Set(a1)
	const s2 = new Set(a2)
	return {
		added: a2.filter(v => !s1.has(v)),
		removed: a1.filter(v => !s2.has(v))
	}
}

export function arrayable(that) {
	return new Proxy(that, {
		get(self, prop) {
			if (!isNaN(prop)) return self.list[prop]
			if (prop === 'length') return self.list.length
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
