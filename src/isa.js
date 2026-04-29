export default (() => {
	const getFuncArgs = func => {
		const str = func.toString()
		const match = str.match(/\(([^)]*)\)/)
		if (!match) return []
		return match[1].split(',').map(arg => arg.trim().replace(/\s*=.*/, ''))
	}
	const constructorArgs = new WeakMap()
	return (...clss) => {
		const isa = clss.map(Cls => Cls.__isa_clss ? [Cls, ...Cls.__isa_clss] : Cls).flat()
		return class {
			static smartInit = false
			static __isa_clss = isa
			constructor(...a) {
				for (const Cls of [...clss].reverse()) {
					if (this.constructor.smartInit) {
						if (!Cls.__isa_clss) {
							if (!constructorArgs.has(Cls)) constructorArgs.set(Cls, getFuncArgs(Cls))
							Object.assign(this, new Cls(...constructorArgs.get(Cls).map(n => a[0][n])))
						}
						else {
							Object.assign(this, new Cls(a[0]))
						}
					}
					else Object.assign(this, new Cls(...a))
				}
				for (const Cls of clss) {
					Object.getOwnPropertyNames(Cls.prototype).forEach(n => {
						if (n === 'constructor' || this[n]) return
						this[n] = Cls.prototype[n].bind(this)
					})
				}
				const chain = new Set([this.constructor, ...isa])
				this.instanceof = cls => chain.has(cls)
			}
			as(Cls, method, ...a) {
				return Cls.prototype[method].apply(this, a)
			}
		}
	}
})()
