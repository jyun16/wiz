import { d, dd, isEmpty, isString, isArray, instanceName, objMap, deepClone, equal, uc, hash, includes, Validator } from '../index.js'
import { escapeHtml, q2f, q2w } from './utils.js'
import { VALID_ARRAY_ARGS } from '../validation.js'

const MULTI = new Set([ 'checkbox', 'rich-select' ])
const LABELED = new Set([ 'select', 'radio', 'checkbox', 'rich-select' ])

class Self {
	constructor(conf={}, p={}, opts={}) {
		this.conf = conf
		this.v = new Validator(this.lang)
		this.set(p)
		if (opts.customErrorMessage) {
			for (const method in opts.customErrorMessage) {
				this.customErrorMessage(method, opts.customErrorMessage[method])
			}
		}
	}
	get() { return this.p }
	set(p) {
		this.p = this.normalizeAll(p)
		this.v.reset()
		return this.p
	}
	normalize(n, v) {
		const o = this.conf[n]
		if (v == null) return v
		if (MULTI.has(o.type)) {
			if (isArray(v)) return v.map(x => x.toString())
			if (isString(v)) {
				if (v[0] == '[') return JSON.parse(v).map(x => x.toString())
				if (v[0] == ',') return v.substring(1, v.length - 1).split(',').filter(x => x != '').map(x => x.toString())
				return [ v.toString() ]
			}
			return [ v.toString() ]
		}
		if (o.type == 'textarea') return v
		return v?.toString()
	}
	normalizeAll(p={}) {
		const conf = this.conf
		const ret = { id: p?.id }
		for (const n in this.conf) {
			if (!(n in p)) continue
			ret[n] = this.normalize(n, p[n])
		}
		return ret
	}
	reset() {
		this.p = {}
		this.resetValidation()
	}
	resetValidation() { this.v.reset() }
	mode(mode) {
		if (!this._conf) this._conf = deepClone(this.conf)
		const conf = deepClone(this._conf)
		for (const n in conf) {
			const o = conf[n]
			if (o.hide && includes(o.hide, mode)) {
				delete this.o[n]
			}
			else if (o.show && !includes(o.show, mode)) {
				delete this.conf[n]
			}
		}
		this.conf = conf
	}
	toDB(p) {
		if (p) { p = this.normalizeAll(p) }
		else { p = this.p }
		const ret = {}
		for (const n in this.conf) {
			if (!(n in p)) continue
			const o = this.conf[n]
			if (o?.db?.skip) continue
			let v = p[n]
			if (isEmpty(v)) continue
			if (MULTI.has(o.type)) ret[n] = `,${v.join(',')},`
			else ret[n] = o.hash ? hash(v, o.hash) : v
		}
		return ret
	}
	toDetail(p) {
		if (p) { p = this.normalizeAll(p) }
		else { p = this.p }
		const ret = { id: p.id }
		for (const n in p) {
			const o = this.conf[n]
			if (!o) continue
			const v = p[n]
			if (o.type == 'textarea') ret[n] = v != null ? escapeHtml(v, { br: true }).replace(/\r?\n/g, '<br>') : ''
			else if (LABELED.has(o.type)) ret[n] = this.labeledValue(n, v)
			else ret[n] = v
		}
		return ret
	}
	listFromDB(list) { return list.map(d => this.toDetail(d)) }
	fields() {
		const ret = {}
		for (const f in this.conf) {
			if (this.conf[f].type == 'db') { continue }
			ret[f] = this.label(f)
		}
		return ret
	}
	label(n) {
		const o = this.conf[n]
		return o.label ? o.label : uc(n)
	}
	optionLabel(n, value) { return this.conf[n].opts[value] ?? '' }
	skip4html(type) { return type == 'db' }
	labeledValue(n, v) {
		if (isArray(v)) { return v.map(x => this.optionLabel(n, x)) }
		else { return this.optionLabel(n, v) }
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
			for (let vn in o.valids) {
				if (this.errors[n]) break
				let va = []
				if (VALID_ARRAY_ARGS.has(vn)) {
					const _va = o.valids[vn]
					va = isArray(_va) ? _va : [ _va ]
				}
				if (vn == 'equal') va[0] = p[o.valids[vn]]
				this.v.call(vn, n, p[n], ...va)
			}
		}
	}
	async _dbValidation(db, vn, n, p, ...va) {
		if (vn == 'unique') {
			const rows = await db.query(`SELECT COUNT(*) AS count FROM ${va[0]} WHERE ${n}=?`, [ p ])
			if (rows[0].count != 0) {
				this.v.appendExtraError(vn, n)
			}
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
			for (let vn of o.dbValids) {
				let va = []
				if (isArray(va)) {
					va = deepClone(vn)
					vn = va.shift()
				}
				await this._dbValidation(db, vn, n, p[n], ...va)
			}
		}
	}
	hasError() { return this.v.hasError() }
	errors(n) { return n ? this.v.errors[n] : this.v.errors }
	setError(n, errMsg) { this.v.appendError(n, errMsg) }
	customErrorMessage(method, msg) { this.v.customMessage(method, msg) }
	customValidation(method, func, msg) { this.v.custom(method, func, msg) }
	q2f(...args) { return q2f(...args) }
	q2w(q, limit=10) { return q2w(q, limit) }
}

export default Self
