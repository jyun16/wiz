import { d, dd, isEmpty, isString, isArray, instanceName, deepClone, equal, uc, hash, includes, Validator } from '../index.js'
import { escapeHtml, query2where } from './utils.js'

const MULTI = new Set([ 'checkbox', 'rich-select' ])

class Self {
	constructor(conf={}, p={}, opts={}) {
		this.conf = conf
		this.p = p
		this.v = new Validator(this.lang)
		if (opts.customErrorMessage) {
			for (const method in opts.customErrorMessage) {
				this.customErrorMessage(method, opts.customErrorMessage[method])
			}
		}
	}
	set(p) {
		this.p = p
		this.v.reset()
	}
	reset() { this.set({}) }
	val(...args) { return this.t.val(...args) }
	mode(mode) {
		for (const n in this.conf) {
			const o = this.conf[n]
			if (o.hide && includes(o.hide, mode)) {
				delete this.o[n]
			}
			else if (o.show && !includes(o.show, mode)) {
				delete this.conf[n]
			}
		}
	}
	toDB() {
		const ret = {}
		const d = this.p
		for (const n in d) {
			const o = this.conf[n]
			if (!o || o.skipDB) continue
			if (MULTI.has(o.type)) {
				if (isString(d[n])) { d[n] = JSON.parse(d[n]) }
				ret[n] = `,${d[n].join(',')},`
			}
			else {
				if (o.hash) ret[n] = hash(d[n], o.hash)
				else ret[n] = d[n]
			}
		}
		return ret
	}
	fromDB(d, label=false) {
		const ret = {}
		for (const n in d) {
			if (n == 'id') { ret.id = d.id; continue }
			if (!this.conf[n]) { continue }
			const o = this.conf[n]
			const type = o.type
			if (type == 'textarea') {
				ret[n] = d[n]
			}
			else {
				if (this.t.isMulti(n)) {
					ret[n] = d[n]?.substring(1, d[n].length - 1).split(',').map(x => x.toString())
				}
				else { ret[n] = d[n]?.toString() }
				if (label && (type == 'select' || type == 'radio' || type == 'checkbox')) {
					ret[n] = this.labeledValue(n, ret[n])
				}
			}
		}
		this.p = ret
		return ret
	}
	detailFromDB(d, label=true) {
		const ret = {}
		for (const n in d) {
			if (n == 'id') { ret.id = d.id; continue }
			if (!this.conf[n]) { continue }
			const o = this.conf[n]
			const type = o.type
			if (type == 'textarea') {
				ret[n] = d[n] != null ? escapeHtml(d[n], { br: true }).replace(/\r?\n/g, '<br>') : ''
			}
			else {
				if (this.t.isMulti(n)) {
					ret[n] = d[n].substring(1, d[n].length - 1).split(',').map(x => x.toString())
				}
				else { ret[n] = d[n]?.toString() }
				if (label && (type == 'select' || type == 'radio' || type == 'checkbox')) {
					ret[n] = this.labeledValue(n, ret[n])
				}
			}
		}
		this.p = ret
		return ret
	}
	listFromDB(list, label=true) {
		const ret = []
		for (const d of list) {
			ret.push(this.detailFromDB(d, label))
		}
		return ret
	}
	fields() {
		const ret = {}
		for (const f in this.conf) {
			if (this.conf[f].type == 'db') { continue }
			ret[f] = this.label(f)
		}
		return ret
	}
	label(n) {
		const conf = this.conf[n]
		return o.label ? o.label : uc(n)
	}
	optionLabel(n, value) {
		const o = this.conf[n].option
		for (let i = 0; i < o.length; i+=2) {
			if (equal(o[i], parseInt(value))) {
				return o[i + 1]
			}
		}
	}
	skip4html(type) {
		return type == 'db'
	}
	labeledValue(n, value) {
		if (this.t.isMulti(n)) {
			if (!isArray(value)) {
				if (/^\,/.test(value)) { value = value.substring(1, value.length - 1) }
				value = value.split(',')
			}
			return value.map(v => this.optionLabel(n, v))
		}
		else {
			return this.optionLabel(n, value)
		}
		return value
	}
	hasDBValids() {
		const conf = this.conf
		for (const n in conf) {
			const o = conf[n]
			if (o.dbValids) return true
		}
		return false
	}
	_target(target) {
		if (isEmpty(target)) target = null
		if (target && isArray(target)) target = new Set(target)
		return target
	}
	validation(...target) {
		const conf = this.conf
		const p = this.p
		target = this._target(target)
		for (const n in conf) {
			const o = conf[n]
			if (!o.valids) continue
			if (target && !target?.has(n)) continue
			for (const va of o.valids) {
				if (this.errors[n]) break
				if (isArray(va)) {
					const vva = deepClone(va)
					const vn = vva.shift()
					if (vn == 'equal') vva[0] = p[vva[0]]
					this.v.call(vn, n, p[n], ...vva)
				}
				else this.v.call(va, n, p[n])
			}
		}
	}
	async _dbValidation(db, n, p, vn, va) {
		if (method == 'unique') {
			// const rows = await db.query(`SELECT COUNT(*) AS count FROM ${va[0]} WHERE ${n}=?`, [ this.v ])
			// if (rows[0].count != 0) {
			// 	this.v.appendExtraError(method, n)
			// }
		}
	}
	async dbValidation(db, ...target) {
		if (!db) return
		const conf = this.conf
		const p = this.p
		target = this._target(target)
		for (const n in conf) {
			const o = conf[n]
			if (!o.dbValids) continue
			if (this.errors[n]) continue
			if (target && !target?.has(n)) continue
			for (let va of o.dbValids) {



				// if (isArray(va)) {
				// 	const vva = deepClone(va)
				// 	const vn = vva.shift()
				// 	await this._dbValidation(db, n, p[n], vn, vva)
				// }
				// else {
				// 	await this._dbValidation(db, n, p[n], vn, [])
				// }
			}
		}
	}
	hasError() {
		return this.v.hasError()
	}
	errors() {
		return this.v.errors
	}
	setError(n, errMsg) {
		this.v.appendError(n, errMsg)
	}
	customErrorMessage(method, msg) {
		this.v.customMessage(method, msg)
	}
	customValidation(method, func, msg) {
		this.v.custom(method, func, msg)
	}
	query2where(q, limit=10) { return query2where(q, limit) }
}

export default Self
