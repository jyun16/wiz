import _ from 'lodash'
import { MD5, SHA1, SHA256, SHA512, Base64 } from 'crypto-es'
import { isEmpty } from './index.js'

export function trim(v) { return _.trim(v) } 
export function uc(v) { return v.toUpperCase() }
export function ucfirst(v) { return _.upperFirst(v) }
export function lc(v) { return v.toLowerCase() }
export function lcfirst(v) { return _.lowerFirst(v) }
export function toCamel(v) { return v.replace(/[-_ ]+(.)/g, (m, c) => c.toUpperCase()).replace(/^(.)/, (m, c) => c.toLowerCase()) }
export function toSnake(v) { return v.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`).replace(/[- ]+/g, '_').replace(/^_+|_+$/g, '') }
export function toKebab(v) { return v.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`).replace(/[_ ]+/g, '-').replace(/^-+|-+$/g, '') }
export function toPascal(v) { return _.upperFirst(_.camelCase(v)) }
export function htmlEscape(v) { return _.escape(v) }

export function comma(v) {
	const formatter = new Intl.NumberFormat('ja-JP')
	return formatter.format(v)
}

export function split(str, delimiter = ',') {
	return str.split(delimiter).map(v => v.trim())
}

export function omit(str, len)	{
	if (isEmpty(str)) { return '' }
	if (str.length <= len) { return str }
	return str ? str.substr(0, len) + '...' : ''
}

export function epoch(dt = null) {
	if (dt) { return Math.round(new Date(dt) / 1000) }
	else { return Math.round(Date.now() / 1000) }
}

export function trimDir(path, cd = '..') {
	const l = cd.match(/\./g).length
	for (let i = 1; i < l; i++) {
		path = path.replace(/[^\/]+$/, '')
		if (path != '/') { path = path.replace(/\/$/, '') }
	}
	return path
}

export function escape4regexp(re) {
	return re.replace(/([\/\\.^$+*?|(){}\[\]])/g, '\\\$1')
}

export function wildMatch(w, str) {
	const e = '_xXWXx_x_'
	const re = new RegExp('^' + escape4regexp(w.replace('*', e)).replace(e, '.+') + '$')
	return re.test(str)
}

export function randStr(len = 16) {
	const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	return Array.from(crypto.getRandomValues(new Uint8Array(len))).map((n) => S[ n % S.length ]).join('')
}

export function randStrTough(len = 16) {
	const S = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:'"<>,.?/`
	return Array.from(crypto.getRandomValues(new Uint8Array(len))).map((n) => S[ n % S.length ]).join('')
}

const algMap = {
	md5: MD5,
	sha1: SHA1,
	sha256: SHA256,
	sha512: SHA512
}

export function hash(str, alg = 'sha512') {
	const hashFn = algMap[alg.toLowerCase()]
	if (!hashFn) throw new Error(`Unsupported alg: ${alg}`)
	return hashFn(str).toString(Base64).slice(0, -2)
}

export function compareHash(hashed, str, alg = 'sha512') {
	return hash(str, alg) === hashed
}

export function tab2sp(text, sp=2) {
	return text.replace(/\t/g, ' '.repeat(sp))
}

export function tabCount(str) { return str.match(/^\t*/)?.[0]?.length }

export function removeIndent(text) { 
	text = text.replace(/^\n/, '').replace(/\n$/, '').split('\n')
	const prefix = text[0].match(/^\s+/)
	text = text.map(x => x.replace(new RegExp(`^${prefix}`), '')).join('\n')
	return text
}

export function codePoint2Hex(cp) {
	if (typeof cp == 'string') {
		cp = parseInt(cp.replace(/^U+/, ''), 16)
	}
	return cp
}

export function codePoint2Char(cp) {
	cp = codePoint2Hex(cp)
	return String.fromCodePoint(cp)
}

export function char2CodePoint(char) {
	return 'U+' + char.codePointAt(0).toString(16).toUpperCase()
}

export function sprintf(format, ...args) {
	let i = 0
	return format.replace(/%([0]?\d*)([sdif])/g, (match, pad, type) => {
		let val = args[i++]
		switch (type) {
			case 'd':
			case 'i':
				val = parseInt(val)
				break
			case 'f':
				val = parseFloat(val)
				break
			case 's':
				val = String(val)
				break
		}
		if (pad) {
			const width = parseInt(pad.replace(/^0/, ''))
			const isZeroPad = pad.startsWith('0')
			return String(val).padStart(width, isZeroPad ? '0' : ' ')
		}
		return val
	})
}
