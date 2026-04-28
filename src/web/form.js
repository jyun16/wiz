import { isEmpty, isString, isArray, equal, uc, hash, includes, Validator } from '../index.js'
import { escapeHtml, query2where } from './utils.js'

class Self {
	constructor(conf={}, param={}, opts={}) {
		this.conf = conf
		this.param = param
		this.error = {}
		this.validator = new Validator(this.lang)
		if (opts.customErrorMessage) {
			for (const method in opts.customErrorMessage) {
				this.customErrorMessage(method, opts.customErrorMessage[method])
			}
		}
	}
	set(param) {
		this.param = param
		this.validator.reset()
		this.error = {}
	}
	reset() {
		this.set({})
	}
	val(...args) {
		return this.t.val(...args)
	}
	mode(mode) {
		for (const name in this.conf) {
			const conf = this.conf[name]
			if (conf.hide && includes(conf.hide, mode)) {
				delete this.conf[name]
			}
			else if (conf.show && !includes(conf.show, mode)) {
				delete this.conf[name]
			}
		}
	}
	toDB() {
		const ret = {}
		const d = this.param
		for (const name in d) {
			const conf = this.conf[name]
			if (!conf) { continue }
			if (conf.ignoreDB) { continue }
			if (this.t.isMulti(name)) {
				if (isString(d[name])) {
					d[name] = JSON.parse(d[name])
				}
				ret[name] = `,${d[name].join(',')},`
			}
			else {
				if (conf.hash) {
					ret[name] = hash(d[name], conf.hash)
				}
				else {
					ret[name] = d[name]
				}
			}
		}
		return ret
	}
	fromDB(d, label=false) {
		const ret = {}
		for (const name in d) {
			if (name == 'id') { ret.id = d.id; continue }
			if (!this.conf[name]) { continue }
			const conf = this.conf[name]
			const type = conf.type
			if (type == 'textarea') {
				ret[name] = d[name]
			}
			else {
				if (this.t.isMulti(name)) {
					ret[name] = d[name]?.substring(1, d[name].length - 1).split(',').map(x => x.toString())
				}
				else { ret[name] = d[name]?.toString() }
				if (label && (type == 'select' || type == 'radio' || type == 'checkbox')) {
					ret[name] = this.labeledValue(name, ret[name])
				}
			}
		}
		this.param = ret
		return ret
	}
	detailFromDB(d, label=true) {
		const ret = {}
		for (const name in d) {
			if (name == 'id') { ret.id = d.id; continue }
			if (!this.conf[name]) { continue }
			const conf = this.conf[name]
			const type = conf.type
			if (type == 'textarea') {
				ret[name] = d[name] != null ? escapeHtml(d[name], { br: true }).replace(/\r?\n/g, '<br>') : ''
			}
			else {
				if (this.t.isMulti(name)) {
					ret[name] = d[name].substring(1, d[name].length - 1).split(',').map(x => x.toString())
				}
				else { ret[name] = d[name]?.toString() }
				if (label && (type == 'select' || type == 'radio' || type == 'checkbox')) {
					ret[name] = this.labeledValue(name, ret[name])
				}
			}
		}
		this.param = ret
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
	label(name) {
		const conf = this.conf[name]
		return conf.label ? conf.label : uc(name)
	}
	optionLabel(name, value) {
		const o = this.conf[name].option
		for (let i = 0; i < o.length; i+=2) {
			if (equal(o[i], parseInt(value))) {
				return o[i + 1]
			}
		}
	}
	skip4html(type) {
		return type == 'db'
	}
	labeledValue(name, value) {
		if (this.t.isMulti(name)) {
			if (!isArray(value)) {
				if (/^\,/.test(value)) { value = value.substring(1, value.length - 1) }
				value = value.split(',')
			}
			return value.map(v => this.optionLabel(name, v))
		}
		else {
			return this.optionLabel(name, value)
		}
		return value
	}
	validation(target) {
		this.validator.check(this.conf, this.param, target)
		this.error = this.validator.hasError() ? this.validator.error : {}
	}
	async dbValidation(conn, target) {
		await this.validator._check(this.conf, this.param, target, async (name, method, args) => {
			if (method == 'unique') {
				const rows = await conn.query(`SELECT COUNT(*) AS count FROM ${args[0]} WHERE ${name}=?`, [ this.param[name] ])
				if (rows[0].count != 0) {
					this.validator.appendExtraError(method, name)
				}
			}
		})
		this.error = this.validator.hasError() ? this.validator.error : {}
	}
	hasError() {
		return !isEmpty(this.error)
	}
	setError(name, errMsg) {
		this.validator.appendError(name, errMsg)
	}
	customErrorMessage(method, msg) {
		this.validator.customMessage(method, msg)
	}
	customValidation(method, func, msg) {
		this.validator.custom(method, func, msg)
	}
	query2where(q, limit=10) { return query2where(q, limit) }
}

export default Self
