import sanitizeHtml from 'sanitize-html'
import { includes } from '../index.js'
import jsObj from '../jsobj.js'

export function urlBase(url) {
	return url.origin + url.pathname
}

export function parseQuery(url) {
	const h = url.indexOf('#')
	const u = h === -1 ? url : url.slice(0, h)
	const q = u.indexOf('?')
	const s = q === -1 ? u : u.slice(q + 1)
	const ret = {}
	if (!s) return ret
	for (const kv of s.split('&')) {
		const i = kv.indexOf('=')
		const k = decodeURIComponent(i === -1 ? kv : kv.slice(0, i))
		if (!k) continue
		const v = i === -1 ? '' : decodeURIComponent(kv.slice(i + 1))
		if (ret[k] !== undefined) {
			if (!Array.isArray(ret[k])) ret[k] = [ret[k]]
			ret[k].push(v)
		}
		else {
			ret[k] = v
		}
	}
	return ret
}

export function buildQuery(p) {
	const r = []
	for (const k in p) {
		const v = p[k]
		const ek = encodeURIComponent(k)
		if (Array.isArray(v)) {
			for (const vv of v) r.push(`${ek}=${encodeURIComponent(vv)}`)
		}
		else {
			r.push(`${ek}=${encodeURIComponent(v)}`)
		}
	}
	return r.join('&')
}

export function appendQuery(url, p = {}) {
	const h = url.indexOf('#')
	const hash = h === -1 ? '' : url.slice(h)
	const u = h === -1 ? url : url.slice(0, h)
	const q = u.indexOf('?')
	const base = q === -1 ? u : u.slice(0, q)
	const qs = buildQuery({ ...parseQuery(q === -1 ? '' : u.slice(q + 1)), ...p })
	return base + (qs ? `?${qs}` : '') + hash
}

export function removeQuery(url, names = []) {
	const h = url.indexOf('#')
	const hash = h === -1 ? '' : url.slice(h)
	const u = h === -1 ? url : url.slice(0, h)
	const q = u.indexOf('?')
	if (q === -1) return url
	const base = u.slice(0, q)
	const params = parseQuery(u.slice(q + 1))
	const n = Array.isArray(names) ? names : names.split(',')
	for (const k of n) delete params[k]
	const qs = buildQuery(params)
	return base + (qs ? `?${qs}` : '') + hash
}

export function escapeHtml(html, allow=null) {
	if (Array.isArray(html)) { return html.map(x => escapeHtml(x, allow)) }
	else if (typeof html !== 'string') { return html }
	if (allow) {
		const conf = {
			disallowedTagsMode: 'escape',
			allowedTags: [],
		}
		for (const tag in allow) {
			conf.allowedTags.push(tag)
			if (typeof allow[tag] == 'boolean') {
				delete allow[tag]
			}
		}
		conf.allowedAttributes = allow
		return sanitizeHtml(html, conf)
	}
	else {
		return String(html).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
	}
}

export const safeTags = {
	br: true,
  a: [ 'href', 'target' ],
  img: [ 'src' ],
}

export function q2f(q) {
  let ret = q.f || '*'
  if (q.f && isArray(q.f)) ret = q.f.join(',')
  return ret
}

export function q2w(q) {
  const ret = q.w ? jsObj.parse(q.w) : {}
  ret['-limit'] = q.l > 100 ? 100 : (q.l || 10)
  ret['-offset'] = (q.p - 1|| 0) * ret['-limit']
  if (q.o != null) {
    if (/,/.test(q.o)) {
      q.o = q.o.split(',').map(x => x.replace(/-d$/, ' DESC'))
    }
    else {
      q.o = q.o.replace(/-d$/, ' DESC')
    }
    ret['-order'] = q.o
  }
  return ret
}

export function genFormData(p) {
  const ret = new FormData()
  objMap(p, (k, v) => {
    if (isArray(v)) {
      for (const vv of v) {
        ret.append(k, vv)
      }
    }
    else {
      ret.append(k, v)
    }
  })
  return ret
}

