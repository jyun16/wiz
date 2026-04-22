import {
	p, pr, cl, range, includes, isNull, isEmpty, expandRange,
	codePoint2Char, char2CodePoint, randStrTough, removeIndent, tab2sp
} from '../src/index.js'
import Test from '../src/test.js'

const isEmptyTest = t => {
	t.true(isNull(null))
	t.true(isNull(undefined))
	t.true(isNull())
	t.true(isEmpty({}))
	t.true(isEmpty([]))
	t.true(isEmpty(null))
	t.true(isEmpty(''))
	t.false(isEmpty('0'))
	t.false(isEmpty({ hoge: 'HOGE' }))
	t.false(isEmpty([ '' ]))
	t.false(isEmpty(0))
	t.false(isEmpty(10))
}

const colorTest = () => {
	p(`WHITE ^RRED ^GGREEN ^BBLUE ^YYELLOW ^MMAGENTA ^CCYAN ^WWHITE ^^W ^GGREEN`)
	pr('hoge', { hoge: 'HOGE' })
	pr({ hoge: 'HOGE' })
	cl(codePoint2Char('U+1F923'))
	cl(codePoint2Char(0x1F923))
	cl(char2CodePoint('🤣'))
	cl(randStrTough())
}

const t = new Test()

t.eq(range(1, 10, 2), [ 1, 3, 5, 7, 9 ])
t.eq(includes(range(0, 3, 2), 2), true)
isEmptyTest(t)
t.eq([ 1, 2, 3 ], expandRange('1..3'))
t.eq([ 1, 2, 3, 5, 8, 9, 10 ], expandRange('1..3, 5, 8..10'))
// colorTest()
