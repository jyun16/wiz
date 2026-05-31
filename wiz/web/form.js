import { d, dd, isEmpty, isString, isArray, isObject,
	equal, uc, hash, clone, includes, objMergeCopy, objFilter,
	Validator, ymdStr
} from '../index.js'
import { escapeHtml } from './utils.js'
import { VALID_ARRAY_ARGS } from '../validation.js'

const MULTI = new Set([ 'checkbox', 'rich-select' ])
const LABELED = new Set([ 'select', 'radio', 'checkbox', 'rich-select' ])
const TYPE_DEFAULT = {
	time: { format: 'HH:mm' },
	date: { format: 'HH:mm' },
	calendar: { format: 'YYYY-MM-DD' },
}
const DB_DEFAULT = {
	id: { db: 'uint', pk: true, autoIncrement: true },
	created: { db: 'datetime', default: 'NOW()', format: 'YYYY-MM-DD HH:mm:ss', search: 'range', show: [ 'list', 'detail' ] },
	modified: { db: 'timestamp', default: 'NOW()', update: 'NOW()', format: 'YYYY-MM-DD HH:mm:ss', search: 'range', show: [ 'list', 'detail' ] },
	deleted: { db: 'datetime', format: 'YYYY-MM-DD HH:mm:ss', search: 'range', show: [ 'list', 'detail' ] },
}
const SEARCH_DEFAULT = {
	input: 'like',
	textarea: 'like',
	radio: 'eq',
	select: 'eq',
	checkbox: 'in',
	'rich-select': 'in',
	time: 'range',
	date: 'range',
	datetime: 'range',
	calendar: 'range',
	password: false,
}
const SEARCH_VALID = [ 'max', 'number', 'emai', 'url' ]

class Self {
	constructor(conf={}, p={}, opts={}) {
		this.setConf(conf)
		this.v = new Validator(this.lang)
		this.set(p)
		if (opts.customErrorMessage) {
			for (const method in opts.customErrorMessage) {
				this.customErrorMessage(method, opts.customErrorMessage[method])
			}
		}
	}
	setConf(conf) {
		conf = clone(conf)
		for (const n in conf) {
			const o = conf[n]
			if (TYPE_DEFAULT[o.type]) { conf[n] = objMergeCopy(TYPE_DEFAULT[o.type], conf[n]) }
			if (DB_DEFAULT[n]) { conf[n] = objMergeCopy(DB_DEFAULT[n], conf[n]) }
			if (!o.label) { conf[n].label = uc(n) }
			if (o.type == 'input') {
				if (!o.attrs?.placeholder) (conf[n].attrs ||= {}).placeholder = conf[n].label
			}
		}
		this.conf = conf
		return conf
	}
	getSearchConf() {
		const ret = {}
		const conf = this.conf
		for (const n in conf) {
			const o = conf[n]
			if (o.show === false) continue
			if (o.show && !o?.show.includes('search')) continue
			if (o.hide && (includes(o.hide, 'search') || includes(o.hide, 'all'))) continue
			if (!o.search && SEARCH_DEFAULT[o.type]) { o.search = SEARCH_DEFAULT[o.type] }
			if (o.db == 'datetime' || o.db == 'timestamp') { o.type = 'datetime' }
			if (o.type == 'textarea') (o.attrs ||= {}).placeholder = o.label
			const valids = objFilter(o.valids, v => SEARCH_VALID.includes(v))
			delete o?.attrs?.style
			ret[n] = { ...o, val: '', valids, attrs: { ...(o.attrs || {}) } }
			delete ret[n].attrs.autofocus
		}
		return ret
	}	
	get() { return this.p }
	set(p) {
		this.p = this.normalizeAll(p)
		this.v.reset()
		return this.p
	}
	mode(mode) {
		if (mode) {
			this._mode = mode
			if (mode == 'search') {
				this.conf = this.getSearchConf()
			}
		}
		return this._mode
	}
	isShow(n) {
		const o = this.conf[n]
		const mode = this._mode
		if (o.show === false) return false
		if (o.show && !includes(o.show, mode)) return false
		if (o.hide && (includes(o.hide, mode) || includes(o.hide, 'all'))) return false
		if (mode == 'search' && o.search === false) return false
		return true
	}
	isDB(n) {
		const o = this.conf[n]
		if (o.db == 'skip') return false
		if (o.pk) return false
		return true
	}
	fields() {
		const ret = {}
		const conf = this.conf
		for (const n in conf) {
			const o = conf[n]
			if (!this.isShow(n)) continue
			ret[n] = o.label
		}
		return ret
	}
	toDB(p) {
		if (p) { p = this.normalizeAll(p) }
		else { p = this.p }
		const ret = {}
		for (const n in this.conf) {
			if (!(n in p)) continue
			const o = this.conf[n]
			if (!this.isDB(n)) continue
			let v = p[n]
			if (isEmpty(v)) continue
			const type = o.type
			if (MULTI.has(type)) ret[n] = `,${v.join(',')},`
			// else if (isObject(v)) ret[n] = JSON.stringify(v)
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
			if (!this.isShow(n)) continue
			const v = p[n]
			if (o.type == 'textarea') ret[n] = v != null ? escapeHtml(v, { br: true }).replace(/\r?\n/g, '<br>') : ''
			else if (LABELED.has(o.type)) ret[n] = this.labeledValue(n, v)
			else ret[n] = v
		}
		return ret
	}
	listFromDB(list) { return list.map(d => this.toDetail(d)) }
	normalize(n, v) {
		const o = this.conf[n]
		if (v == null) return v
		const type = o.type
		if (MULTI.has(type)) {
			if (isArray(v)) return v.map(x => x.toString())
			if (isString(v)) {
				if (v[0] == '[') return JSON.parse(v).map(x => x.toString())
				if (v[0] == ',') return v.substring(1, v.length - 1).split(',').filter(x => x != '').map(x => x.toString())
				return [ v.toString() ]
			}
			return [ v.toString() ]
		}
		if (isObject(v)) return v
		if (type == 'textarea') return v
		else if (type == 'date' || type == 'calendar') return ymdStr(v)
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
			const table = va[0]
			const pk = va[1] || 'id'
			const where = [ `${n}=?` ]
			const args = [ p[n] ]
			if (p[pk]) {
				where.push(`${pk}<>?`)
				args.push(p[pk])
			}
			const rows = await db.query(`SELECT COUNT(*) AS count FROM ${table} WHERE ${where.join(' AND ')}`, args)
			if (rows[0].count != 0) this.v.setExtraError(n, vn)
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
			for (let vn in o.dbValids) {
				let va = o.dbValids[vn]
				if (va === true) va = []
				else if (!isArray(va)) va = [ va ]
				await this._dbValidation(db, vn, n, p, ...va)
			}
		}
	}
	hasError() { return this.v.hasError() }
	errors(n) { return n ? this.v.errors[n] : this.v.errors }
	setError(n, err) { this.v.setError(n, err) }
	customErrorMessage(method, msg) { this.v.customMessage(method, msg) }
	customValidation(method, func, msg) { this.v.custom(method, func, msg) }
}

export default Self
