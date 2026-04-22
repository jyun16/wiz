import dayjs from 'dayjs'
import { isObject } from './index.js'

export function epoch(dt = null) {
	if (dt) { return Math.round(new Date(dt) / 1000) }
	else { return Math.round(Date.now() / 1000) }
}

export function epoch2date(epoch) {
	return dayjs.unix(epoch)
}

export function date2epoch(date) {
	return dateObj(date).unix()
}

export function now() {
	return dateFormat(new Date())
}

export function ymd(v) {
	if (v)  {
		const [ y, m, d ] = v.split('-')
		return [ parseInt(y), parseInt(m), parseInt(d) ]
	}
	const n = new Date()
	return [ n.getFullYear(), n.getMonth() + 1, n.getDate() ]
}

export function ymdStr(v) {
	if (v) return v.split('-')
	const n = new Date()
	const y = String(n.getFullYear())
	const [ m, d ] = [ n.getMonth() + 1, n.getDate() ].map(v => String(v).padStart(2, '0'))
	return [ y, m, d ]
}

export function hm(v) {
	if (v)  {
		const [ h, m, s ] = v.split(':')
		return [ parseInt(h), parseInt(m) ]
	}
	const n = new Date()
	return [ n.getHours(), n.getMinutes() ]
}

export function hmStr(v) {
	if (v) return v.split(':')
	const n = new Date()
	return [ n.getHours(), n.getMinutes() ].map(v => String(v).padStart(2, '0'))
}

export function hms(v) {
	if (v)  {
		const [ h, m, s ] = v.split(':')
		return [ parseInt(h), parseInt(m), parseInt(s) ]
	}
	const n = new Date()
	return [ n.getHours(), n.getMinutes(), n.getSeconds() ]
}

export function hmsStr(v) {
	if (v) return v.split(':')
	const n = new Date()
	return [ n.getHours(), n.getMinutes(), n.getSeconds() ].map(v => String(v).padStart(2, '0'))
}

export function nowObj() {
	return dayjs()
}

export function dateObj(date) {
	if (isObject(date)) { return date }
	if (/^\d+$/.test(date)) { date = epoch2date(date) }
	return dayjs(date)
}

export function dateFormat(date, format = 'YYYY-MM-DD HH:mm:ss') {
	return dateObj(date).format(format)
}

export function simpleDate(date) {
	const now = dateObj(date)
	date = dayjs(date)
	let format = 'YYYY年MM月DD日 HH時mm分'
	if (now.year() == date.year()) {
		if (now.month() == date.month()) {
			format = 'D日 H時m分'
		}
		else {
			format = 'M月D日 H時m分'
		}
	}
	return date.format(format)
}

export function jpYMDW(date, _now) {
	if (!_now) { _now = nowObj() }
	date = dateObj(date)
	const w = [ '日', '月', '火', '水', '木', '金', '土' ]
	if (date.isSame(_now, 'day')) {
		return '今日'
	}
	else if (date.isSame(_now.subtract(1, 'day'), 'day')) {
		return '昨日'
	}
	else {
		return date.format(`MM月DD日(${w[date.get('day')]})`)
	}
}

export function trimDir(path, cd = '..') {
	const l = cd.match(/\./g).length
	for (let i = 1; i < l; i++) {
		path = path.replace(/[^\/]+$/, '')
		if (path != '/') { path = path.replace(/\/$/, '') }
	}
	return path
}
