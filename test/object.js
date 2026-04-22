import {
	setMapVal, deleteMapVal, hasMapKey, sliceMapVal, spliceMapVal, sliceMap, addCountMap,
	getMapVal, getMapKeys, deleteMapByVal
} from '../src/object.js'

import Test from '../src/test.js'

const t = new Test()

t.eq({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, setMapVal({ foo: 'FOO' }, 'hoge.fuga', 'FUGA'))

let map = {}
t.eq(setMapVal(map, 'val.xxx', 'XXX'), { val: { xxx: 'XXX' }})
t.eq(setMapVal(map, 'val.yyy', 'YYY'), { val: { xxx: 'XXX', yyy: 'YYY' }})
t.eq(setMapVal(map, 'val.zzz', 'ZZZ'), { val: { xxx: 'XXX', yyy: 'YYY', zzz: 'ZZZ' }})
deleteMapVal(map, 'val.zzz')
t.eq(map, { val: { xxx: 'XXX', yyy: 'YYY' }})

map = { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: 'FOO' }, 'FUGA 3' ] }
t.eq(setMapVal(map, 'fuga[1].foo', 'XXX'), { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: 'XXX' }, 'FUGA 3' ] })

t.eq(getMapVal({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'foo'), 'FOO')
t.eq(getMapVal({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'foo.bar'), null)
t.eq(getMapVal({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'hoge'), { fuga: 'FUGA' })
t.eq(getMapVal({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'hoge.fuga'), 'FUGA')
t.eq(getMapVal({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'hoge.fuga.foo'), null)
t.eq(getMapVal({ foo: [ 'FOO 1', 'FOO 2', 'FOO 3' ] }, 'foo[1]'), 'FOO 2')
t.eq(getMapVal({ foo: [ 'FOO 1', { bar: 'BAR' }, 'FOO 3' ] }, 'foo[1].bar'), 'BAR')
t.eq(getMapVal({ foo: { bar: [ 'BAR 1', 'BAR 2', 'BAR 3' ] }}, 'foo.bar[1]'), 'BAR 2')

t.eq(getMapKeys({
	'1': 'X',
	'2': {
		'2-1': 'X',
		'2-2': 'X',
		'2-3': {
			'2-3-1': 'X',
		}
	}
}), [ '1', '2.2-1', '2.2-2', '2.2-3.2-3-1' ])

t.true(hasMapKey({ foo: 'FOO', hoge: { fuga: { foo: { bar: true } } } }, 'hoge.fuga.foo.bar'))
t.false(hasMapKey({ foo: 'FOO', hoge: { fuga: { foo: { bar: true } } } }, 'hoge.fuga.x'))
t.true(hasMapKey({ foo: [ 'FOO 1', { bar: 'BAR' }, 'FOO 3' ] }, 'foo[1].bar'))

map = { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: 'FOO' }, 'FUGA 3' ] }
deleteMapVal(map, 'fuga[1].foo')
t.eq(map, { hoge: 'HOGE', fuga: [ 'FUGA 1', {}, 'FUGA 3' ] })

map = { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: [ 'FOO 1', { bar: 'BAR' }, 'FOO 2' ] }, 'FUGA 3' ] }
t.eq(sliceMapVal(map, 'fuga[1].foo', 1, 2), [ { bar: 'BAR' } ])

spliceMapVal(map, 'fuga[1].foo', 1, 1)
t.eq(map, { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: [ 'FOO 1', 'FOO 2' ] }, 'FUGA 3' ] } )

const mmm = { hoge: 'HOGE', fuga: 'FUGA', foo: null, bar: '' }
deleteMapByVal(mmm, 'FUGA')
deleteMapByVal(mmm, null)
deleteMapByVal(mmm, '')
t.eq(mmm, { hoge: 'HOGE' })

t.eq(sliceMap({ hoge: 10, fuga: 11, foo: 12, bar: 13, baz: 14 }, 1, 3), { fuga: 11, foo: 12, bar: 13 })

let m = {}
m = addCountMap(m, 'hoge')
t.eq({ hoge: 0 }, m)
m = addCountMap(m, 'fuga')
t.eq({ hoge: 1, fuga: 0 }, m)
m = addCountMap(m, 'fuga')
t.eq({ fuga: 1, hoge: 0 }, m)
m = addCountMap(m, 'fuga')
t.eq({ fuga: 1, hoge: 0 }, m)
m = addCountMap(m, 'hoge')
t.eq({ hoge: 1, fuga: 0 }, m)
m = addCountMap(m, 'foo')
t.eq({ hoge: 2, fuga: 1, foo: 0 }, m)
m = addCountMap(m, 'foo')
t.eq({ hoge: 2, foo: 1, fuga: 0 }, m)
m = addCountMap(m, 'fuga')
t.eq({ hoge: 2, fuga: 1, foo: 0 }, m)
m = addCountMap(m, 'hoge')
t.eq({ hoge: 2, fuga: 1, foo: 0 }, m)
m = addCountMap(m, 'bar')
t.eq({ hoge: 3, fuga: 2, foo: 1, bar: 0 }, m)
