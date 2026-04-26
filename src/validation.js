import { trim, equal, compare, isEmpty } from './index.js'

const self = {
	required: v => !isEmpty(trim(v)),
	requiredChoice: v => Array.isArray(v) ? v.length > 0 : !!v,
	equal,
	compare,
	number: v => /^\d+$/.test(v),
	integer: v => /^-?\d+$/.test(v),
	min: (v, n) => (v || '').length >= n,
	max: (v, n) => (v || '').length <= n,
	email: v => /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v),
	zipcode: v => /^\d{3}-?\d{4}$/.test(v),
	phone: v => /^\d{2,5}-\d{1,4}-\d{4}$/.test(v),
	zenkaku: v => !/^(\w| |'|,|&|[ｦ-ﾟ])+$/.test(v),
	hiragana: v => /^[\u3041-\u3096]+$/.test(v),
	katakana: v => /^[\u30a1-\u30f6]+$/.test(v),
	hanKatakana: v => /^[ｦ-ﾟ]+$/.test(v),
	alphanum: v => /^[0-9a-zA-Z]+$/.test(v),
	alphabet: v => /^[a-zA-Z]+$/.test(v),
	password: pw => /[0-9]/.test(pw) && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(pw),
	creditcard: v => /^(4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|^(?:2131|1800|35\d{3})\d{11}$)$/.test(String(v).replace(/-/g, '')),
	confirm: v2 => v => v === v2,
	url: v => /^[a-z]*:\/\/[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+$/.test(v),
	httpUrl: v => /^https?:\/\/[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+$/.test(v),
	datetime: dt => {
		if (isEmpty(dt)) return true
		const p = String(dt).split(' ')
		return p.length === 2 && self.date(p[0]) && self.time(p[1])
	},
	date: d => {
		if (isEmpty(d)) return true
		const p = String(d).split(/[-/]/)
		if (p.length !== 3 || !/\d{4}/.test(p[0])) return false
		const [y, m, day] = p.map(Number)
		return m >= 1 && m <= 12 && day >= 1 && day <= new Date(y, m, 0).getDate()
	},
	time: t => {
		if (isEmpty(t)) return true
		const p = String(t).split(':')
		if (p.length !== 3) return false
		const [h, m, s] = p.map(Number)
		return h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59
	},
	hourmin: t => {
		if (isEmpty(t)) return true
		const p = String(t).split(':')
		if (p.length !== 2) return false
		const [h, m] = p.map(Number)
		return h >= 0 && h <= 23 && m >= 0 && m <= 59
	},
	inList: (v, list) => Array.isArray(list) && list.includes(v),
	boolean: v => /^(true|false|1|0)$/i.test(String(v)),
	ip: v => /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v),
	json: v => {
		if (typeof v !== 'string') return false
		try {
			JSON.parse(v)
			return true
		}
		catch (e) {
			return false
		}
	}
}

export default self
