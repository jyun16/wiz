import lodash from 'lodash'
import sanitizeHtml from 'sanitize-html'
import { p, cl, isMain, includes } from '../index.js'

export function urlBase(url) {
	return url.origin + url.pathname
}

export function parseQuery(url) {
	if (/^https?:/.test(url)) {
		if (lodash.isString(url)) { url = new URL(url) }
		return Object.fromEntries(url.searchParams)
	}
	let [ query, s ] = url.split('?')
	if (s) { query = s }
	const ret = {}
	for (let kv of query.split('&')) {
		const [ k, v ] = kv.split('=')
		ret[encodeURIComponent(k)] = encodeURIComponent(v)
	}
	return ret
}

export function buildQuery(p) {
	return (new URLSearchParams(p)).toString()
}

export function appendQuery(url, p={}) {
	if (lodash.isString(url)) { url = new URL(url) }
	p = { ...(Object.fromEntries((new URLSearchParams(url.search).entries()))), ...p }
	return url.origin + url.pathname + (Object.keys(p).length ? `?${buildQuery(p)}` : '')
}

export function removeQuery(url, names=[]) {
	if (!Array.isArray(names)) { names = names.split(',') }
	let [ ret, q ] = url.split('?')
	q = Object.fromEntries((new URLSearchParams(q).entries()))
	for (const name of names) { delete q[name] }
	if (Object.keys(q).length) { ret += '?' + new URLSearchParams(q).toString() }
	return ret
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

export function query2where(q, limit=10) {
	let ret = {}
	if (q.w != null) { ret = JSON.parse(q.w) }
	ret['-limit'] = limit
	ret['-offset'] = (q.p - 1|| 0) * ret['-limit']
	if (q.s != null) {
		if (/,/.test(q.s)) {
			q.s = q.s.split(',').map(x => {
				return x.replace(/-d$/, ' DESC')
			})
		}
		else {
			q.s = q.s.replace(/-d$/, ' DESC')
		}
		ret['-order'] = q.s
	}
	return ret
}


export const safeTags = {
	br: true,
  a: [ 'href', 'target' ],
  img: [ 'src' ],
}

export function getP(FORM, formData) {
	const ret = {}
	const names = Object.keys(FORM)
	for (const name of names) {
		const o = FORM[name]
		const t = o.type
		if (includes([ 'multi_select', 'checkbox' ], t)) {
			ret[name] = formData.getAll(name)
		}
		else {
			ret[name] = formData.get(name)
		}
	}
	return ret
}

if (isMain(import.meta.url)) {
	(async () => {
		const Test = (await import('../test.js')).default
		const t = new Test()
//    cl(sanitizeHtml.defaults)

		t.eq(escapeHtml('hoge<br>hoge'), 'hoge&lt;br&gt;hoge')
		t.eq(escapeHtml('hoge<br>hoge', { br: true }), 'hoge<br />hoge')
		t.eq(escapeHtml([ 'hoge<br>hoge' ], { br: true }), [ 'hoge<br />hoge' ])
		t.eq(escapeHtml('hoge<br>hoge', safeTags), 'hoge<br />hoge')
		t.eq(escapeHtml(`<a href='http://www.google.com' target=_blank name='hoge'>`, safeTags),
			'<a href="http://www.google.com" target="_blank"></a>')
		t.eq(removeQuery('hoge?id=100', 'id'), 'hoge')
		t.eq(removeQuery('hoge?x=10&id=100', 'id'), 'hoge?x=10')
		t.eq(removeQuery('hoge?x=10&id=100&y=10', 'id'), 'hoge?x=10&y=10')
		t.eq(removeQuery('hoge?id=100&y=10', 'id'), 'hoge?y=10')
		t.eq(removeQuery('hoge?x=10&id=100&y=10&z=10', 'id,y'), 'hoge?x=10&z=10')
	})()
}

/*

const allowedAttributes = {
  a: ['href', 'name', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  div: ['class', 'id', 'style'],
  span: ['class', 'id', 'style'],
  p: ['class', 'id', 'style'],
  h1: ['class', 'id', 'style'],
  h2: ['class', 'id', 'style'],
  h3: ['class', 'id', 'style'],
  h4: ['class', 'id', 'style'],
  h5: ['class', 'id', 'style'],
  h6: ['class', 'id', 'style'],
  ul: ['class', 'id', 'style'],
  ol: ['class', 'id', 'style'],
  li: ['class', 'id', 'style'],
  table: ['class', 'id', 'style', 'border'],
  tr: ['class', 'id', 'style'],
  td: ['class', 'id', 'style', 'colspan', 'rowspan'],
  th: ['class', 'id', 'style', 'colspan', 'rowspan'],
};

const clean = sanitizeHtml(dirtyHtml, {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'tr', 'td', 'th' ]),
  allowedAttributes: allowedAttributes
});

*/

