import jsObj from '../src/jsobj.js'
import Test from '../src/test.js'

const t = new Test()

t.eq(true, jsObj.parse(`true`))
t.eq(false, jsObj.parse(`false`))
t.eq('123 123', jsObj.parse(`123 123`))
t.eq('HOGE 1', jsObj.parse(`HOGE 1`))

t.eq({
	hoge: 'HOGE 1',
	fuga: [ 'fuga 1', 'fuga 2' ],
	foo: new Set(['foo 1', 'foo 2']),
	bar: ['bar1', 'bar2'],
	baz: new Set(['baz1', 'baz2']),
}, jsObj.parse(`{
	hoge: 'HOGE 1',
	fuga: [ 'fuga 1', 'fuga 2' ],
	foo: < 'foo 1', 'foo 2' >,
	bar: [[ bar1 bar2 ]]
	baz: << baz1 baz2 >>
}`))

t.ceq(jsObj.dump({
	hoge: 'HOGE',
	fuga: [ 'fuga 1', 'fuga 2' ],
	foo: new Set(['foo 1', 'foo 2']),
	bar: ['bar1', 'bar2'],
	baz: new Set(['baz1', 'baz2']),
}), `{
	hoge: 'HOGE',
	fuga: [
		'fuga 1',
		'fuga 2'
	],
	foo: < 'foo 1', 'foo 2' >,
	bar: [
		'bar1',
		'bar2'
	],
	baz: < 'baz1', 'baz2' >
}`)

t.ceq(jsObj.dump({
	id: `id='ID'`
}), `{
	id: 'id=\\'ID\\''
}`)

t.ceq(jsObj.dump({
	'p.hoge': `HOGE`,
	'p-hoge': `HOGE`,
}), `{ 'p.hoge':'HOGE',p-hoge:'HOGE' }`)
