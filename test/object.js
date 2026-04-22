import {
	setObjVal, deleteObjVal, hasObjKey, sliceObjVal, spliceObjVal, sliceObj, addCountObj,
	getObjVal, getObjKeys, deleteObjByVal
} from '../src/object.js'

import Test from '../src/test.js'

const t = new Test()

t.eq({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, setObjVal({ foo: 'FOO' }, 'hoge.fuga', 'FUGA'))

let map = {}
t.eq(setObjVal(map, 'val.xxx', 'XXX'), { val: { xxx: 'XXX' }})
t.eq(setObjVal(map, 'val.yyy', 'YYY'), { val: { xxx: 'XXX', yyy: 'YYY' }})
t.eq(setObjVal(map, 'val.zzz', 'ZZZ'), { val: { xxx: 'XXX', yyy: 'YYY', zzz: 'ZZZ' }})
deleteObjVal(map, 'val.zzz')
t.eq(map, { val: { xxx: 'XXX', yyy: 'YYY' }})

map = { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: 'FOO' }, 'FUGA 3' ] }
t.eq(setObjVal(map, 'fuga[1].foo', 'XXX'), { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: 'XXX' }, 'FUGA 3' ] })

t.eq(getObjVal({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'foo'), 'FOO')
t.eq(getObjVal({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'foo.bar'), null)
t.eq(getObjVal({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'hoge'), { fuga: 'FUGA' })
t.eq(getObjVal({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'hoge.fuga'), 'FUGA')
t.eq(getObjVal({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'hoge.fuga.foo'), null)
t.eq(getObjVal({ foo: [ 'FOO 1', 'FOO 2', 'FOO 3' ] }, 'foo[1]'), 'FOO 2')
t.eq(getObjVal({ foo: [ 'FOO 1', { bar: 'BAR' }, 'FOO 3' ] }, 'foo[1].bar'), 'BAR')
t.eq(getObjVal({ foo: { bar: [ 'BAR 1', 'BAR 2', 'BAR 3' ] }}, 'foo.bar[1]'), 'BAR 2')

t.eq(getObjKeys({
	'1': 'X',
	'2': {
		'2-1': 'X',
		'2-2': 'X',
		'2-3': {
			'2-3-1': 'X',
		}
	}
}), [ '1', '2.2-1', '2.2-2', '2.2-3.2-3-1' ])

t.true(hasObjKey({ foo: 'FOO', hoge: { fuga: { foo: { bar: true } } } }, 'hoge.fuga.foo.bar'))
t.false(hasObjKey({ foo: 'FOO', hoge: { fuga: { foo: { bar: true } } } }, 'hoge.fuga.x'))
t.true(hasObjKey({ foo: [ 'FOO 1', { bar: 'BAR' }, 'FOO 3' ] }, 'foo[1].bar'))

map = { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: 'FOO' }, 'FUGA 3' ] }
deleteObjVal(map, 'fuga[1].foo')
t.eq(map, { hoge: 'HOGE', fuga: [ 'FUGA 1', {}, 'FUGA 3' ] })

map = { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: [ 'FOO 1', { bar: 'BAR' }, 'FOO 2' ] }, 'FUGA 3' ] }
t.eq(sliceObjVal(map, 'fuga[1].foo', 1, 2), [ { bar: 'BAR' } ])

spliceObjVal(map, 'fuga[1].foo', 1, 1)
t.eq(map, { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: [ 'FOO 1', 'FOO 2' ] }, 'FUGA 3' ] } )

const mmm = { hoge: 'HOGE', fuga: 'FUGA', foo: null, bar: '' }
deleteObjByVal(mmm, 'FUGA')
deleteObjByVal(mmm, null)
deleteObjByVal(mmm, '')
t.eq(mmm, { hoge: 'HOGE' })

t.eq(sliceObj({ hoge: 10, fuga: 11, foo: 12, bar: 13, baz: 14 }, 1, 3), { fuga: 11, foo: 12, bar: 13 })

let m = {}
m = addCountObj(m, 'hoge')
t.eq({ hoge: 0 }, m)
m = addCountObj(m, 'fuga')
t.eq({ hoge: 1, fuga: 0 }, m)
m = addCountObj(m, 'fuga')
t.eq({ fuga: 1, hoge: 0 }, m)
m = addCountObj(m, 'fuga')
t.eq({ fuga: 1, hoge: 0 }, m)
m = addCountObj(m, 'hoge')
t.eq({ hoge: 1, fuga: 0 }, m)
m = addCountObj(m, 'foo')
t.eq({ hoge: 2, fuga: 1, foo: 0 }, m)
m = addCountObj(m, 'foo')
t.eq({ hoge: 2, foo: 1, fuga: 0 }, m)
m = addCountObj(m, 'fuga')
t.eq({ hoge: 2, fuga: 1, foo: 0 }, m)
m = addCountObj(m, 'hoge')
t.eq({ hoge: 2, fuga: 1, foo: 0 }, m)
m = addCountObj(m, 'bar')
t.eq({ hoge: 3, fuga: 2, foo: 1, bar: 0 }, m)
