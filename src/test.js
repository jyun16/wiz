import path from 'path'
import { fileURLToPath } from 'url'
import { isNull, isEmpty, isNumber, isString } from './index.js'
import { p, caller } from './debug.js'

const SELF = fileURLToPath(import.meta.url)

function stackFile(s) {
	const m = s.trim().match(/\(?(.+):(\d+):(\d+)\)?$/)
	if (!m) return null
	let file = m[1].replace(/^at .* \(/, '').replace(/^at /, '')
	if (file.startsWith('file://')) file = fileURLToPath(file)
	return { file, line: m[2], col: m[3] }
}

const Self = class {

	constructor(name = '') {
		if (!name) {
			const c = caller(1).split(':')
			name = path.basename(c[1], '.js')
		}
		this.name = name
		this.count = 0
		this.ok = 0
		this.ng = 0
		if (Self.noPrint) return
		p('^B[%s]', name)
		process.on('exit', () => {
      this.result()
    })
	}
	strip(s) {
		return s.replace(/^\s*$/gm, '').replace(/\s+/g, '').trim()
	}
	result() {
		if (this.count > 0) {
			if (this.ng > 0) {
				p('^RFAILED ^W%s/%s %s%%', this.ok, this.count, (this.ok/this.count * 100).toFixed(2))
				if (this.ng > 0) process.exit(1)
			}
			else {
				p('^GSUCCEEDED ^W%s/%s', this.ok, this.count)
			}
		}
	}
  _chk(v1, v2, op, label) {
    if (typeof v1 == 'object' && v1 !== null) {
      v1 = JSON.stringify(v1)
      v2 = JSON.stringify(v2)
    }
    this.print(v1, v2, label, op(v1, v2))
  }
	eq(v1, v2, label = '') { this._chk(v1, v2, (a, b) => a == b, label) }
	ne(v1, v2, label = '') { this._chk(v1, v2, (a, b) => a != b, label) }
	true(v, label = '') { this.eq(v, true, label) }
	false(v, label = '') { this.eq(v, false, label) }
	include(v1, v2, label = '') { this.print(v1, v2, label, this._chkInclude(v1, v2)) }
  exclude(v1, v2, label = '') { this.print(v1, v2, label, !this._chkInclude(v1, v2)) }
  _chkInclude(v1, v2) {
    if (typeof v1 == 'string' || Array.isArray(v1)) {
      return v2 != null && v2.includes(v1)
    }
    if (typeof v1 == 'object' && v1 !== null) {
      return v2 != null && v1 in v2
    }
    return false
  }
	_html(s) {
    return s.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim()
  }
	html(v1, v2, label = '') {
    this.print(v1, v2, label, this._html(v1) == this._html(v2))
  }
	ceq(v1, v2, label = '') {
		v1 = this.strip(v1)
		v2 = this.strip(v2)
		this.print(v1, v2, label, v1 == v2)
	}
	re(v1, v2, label = '') {
		this.print(v1, v2, label, v2.test(v1))
	}
	pass(label = '') { this.true(true, label) }
	isString(v, label = '') { this.true(isString(v), label) }
	isNumber(v, label = '') { this.true(isNumber(v), label) }
	isNull(v, label = '') { this.true(isNull(v), label) }
	isNotNull(v, label = '') { this.true(!isNull(v), label) }
	isEmpty(v, label = '') { this.true(isEmpty(v), label) }
	isNotEmpty(v, label = '') { this.true(!isEmpty(v), label) }
	testCaller() {
		for (const s of new Error().stack.split('\n').slice(1)) {
			const c = stackFile(s)
			if (!c) continue
			if (c.file == SELF) continue
			if (c.file.startsWith('node:')) continue
			return c
		}
		return { file: '', line: '', col: '' }
	}
	print(v1, v2, label, ok = false) {
		if (Self.noPrint) return
		const { line } = this.testCaller()
		this.count++
		if (label == '') {
			label = `test ${this.count}`
		}
		if (ok) {
			this.ok++
			p('^G[%s] ^W%s ... ^GOK ^C(%s)', this.count, label, line)
		}
		else {
			this.ng++
			p('^R[%s] ^W%s ... ^RNG ^C(%s)', this.count, label, line)
			p('^Y%s\n^W----\n^M%s', v1, v2)
		}
	}
}

Self.noPrint = false

export default Self
