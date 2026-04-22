import {
	toPascal, comma, escape4regexp, wildMatch, omit
} from '../src/string.js'
import Test from '../src/test.js'

const t = new Test()

t.eq(toPascal('hoge_fuga'), 'HogeFuga')
t.eq(comma(1000), '1,000')
t.eq(comma('1000'), '1,000')
t.eq(escape4regexp('(hoge)/[fuga]'), '\\(hoge\\)\\/\\[fuga\\]')
t.true(wildMatch('*.js', 'hoge.js'))
t.false(wildMatch('*.js', 'hoge.pl'))
t.eq(omit('あいうえお', 3), 'あいう...')
t.eq(omit('あいう', 10), 'あいう')
