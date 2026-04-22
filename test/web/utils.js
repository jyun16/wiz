import { includes } from '../../src/index.js'
import Test from '../../src/test.js'
import { escapeHtml, safeTags, removeQuery } from '../../src/web/utils.js'

const t = new Test()
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
