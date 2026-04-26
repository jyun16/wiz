import * as objUtils from '../src/object.js'
Object.assign(globalThis, objUtils)
import Test from '../src/test.js'

const t = new Test()

t.eq({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, objSet({ foo: 'FOO' }, 'hoge.fuga', 'FUGA'))

let map = {}
t.eq(objSet(map, 'val.xxx', 'XXX'), { val: { xxx: 'XXX' }})
t.eq(objSet(map, 'val.yyy', 'YYY'), { val: { xxx: 'XXX', yyy: 'YYY' }})
t.eq(objSet(map, 'val.zzz', 'ZZZ'), { val: { xxx: 'XXX', yyy: 'YYY', zzz: 'ZZZ' }})
objDelete(map, 'val.zzz')
t.eq(map, { val: { xxx: 'XXX', yyy: 'YYY' }})

map = { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: 'FOO' }, 'FUGA 3' ] }
t.eq(objSet(map, 'fuga[1].foo', 'XXX'), { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: 'XXX' }, 'FUGA 3' ] })

t.eq(objGet({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'foo'), 'FOO')
t.eq(objGet({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'foo.bar'), null)
t.eq(objGet({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'hoge'), { fuga: 'FUGA' })
t.eq(objGet({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'hoge.fuga'), 'FUGA')
t.eq(objGet({ foo: 'FOO', hoge: { fuga: 'FUGA' } }, 'hoge.fuga.foo'), null)
t.eq(objGet({ foo: [ 'FOO 1', 'FOO 2', 'FOO 3' ] }, 'foo[1]'), 'FOO 2')
t.eq(objGet({ foo: [ 'FOO 1', { bar: 'BAR' }, 'FOO 3' ] }, 'foo[1].bar'), 'BAR')
t.eq(objGet({ foo: { bar: [ 'BAR 1', 'BAR 2', 'BAR 3' ] }}, 'foo.bar[1]'), 'BAR 2')

t.eq(objKeysDeep({
	'1': 'X',
	'2': {
		'2-1': 'X',
		'2-2': 'X',
		'2-3': {
			'2-3-1': 'X',
		}
	}
}), [ '1', '2.2-1', '2.2-2', '2.2-3.2-3-1' ])

t.true(objHas({ foo: 'FOO', hoge: { fuga: { foo: { bar: true } } } }, 'hoge.fuga.foo.bar'))
t.false(objHas({ foo: 'FOO', hoge: { fuga: { foo: { bar: true } } } }, 'hoge.fuga.x'))
t.true(objHas({ foo: [ 'FOO 1', { bar: 'BAR' }, 'FOO 3' ] }, 'foo[1].bar'))

map = { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: 'FOO' }, 'FUGA 3' ] }
objDelete(map, 'fuga[1].foo')
t.eq(map, { hoge: 'HOGE', fuga: [ 'FUGA 1', {}, 'FUGA 3' ] })

map = { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: [ 'FOO 1', { bar: 'BAR' }, 'FOO 2' ] }, 'FUGA 3' ] }
t.eq(objSliceVal(map, 'fuga[1].foo', 1, 2), [ { bar: 'BAR' } ])

objSpliceVal(map, 'fuga[1].foo', 1, 1)
t.eq(map, { hoge: 'HOGE', fuga: [ 'FUGA 1', { foo: [ 'FOO 1', 'FOO 2' ] }, 'FUGA 3' ] } )

const mmm = { hoge: 'HOGE', fuga: 'FUGA', foo: null, bar: '' }
objDeleteByVal(mmm, 'FUGA')
objDeleteByVal(mmm, null)
objDeleteByVal(mmm, '')
t.eq(mmm, { hoge: 'HOGE' })

const flatBase = { a: { b: 1 }, c: 2 }
t.eq({ 'a.b': 1, 'c': 2 }, objFlatten(flatBase))
t.eq(['a.b', 'c'], objKeysDeep(flatBase))

const pickBase = { a: 1, b: 2, c: 3 }
t.eq({ a: 1, c: 3 }, objPick(pickBase, ['a', 'c']))
t.eq({ b: 2 }, objOmit(pickBase, ['a', 'c']))

t.eq({ a: 2, b: 4 }, objMap({ a: 1, b: 2 }, (v, k) => v * 2))

const m1 = { a: 1, b: { x: 1 } }
const m2 = { b: { y: 2 }, c: 3 }
t.eq({ a: 1, b: { x: 1, y: 2 }, c: 3 }, objMerge({}, m1, m2))

t.eq({ a: 1, b: { c: 2 } }, objCompact({ a: 1, b: { c: 2, d: '' }, e: null }))

const cloneOri = { a: { b: 1 } }
const cloned = objClone(cloneOri)
t.eq(true, cloneOri !== cloned && cloneOri.a.b === cloned.a.b)

const scores = { b: 10, a: 50, c: 30 }
t.eq({ a: 50, c: 30, b: 10 }, objSortByVal(scores, true)) 

t.eq({ val: 'key' }, objSwap({ key: 'val' }))

const list = [{ id: '10' }, { id: '2' }, { id: '5' }]
t.eq([{ id: '2' }, { id: '5' }, { id: '10' }], objSortList(list, 'id'))

const frozen = objDeepFreeze({ a: { b: 1 } })
try {
  frozen.a.b = 2
} catch (e) {}
t.eq(1, frozen.a.b)

t.eq(objSlice({ hoge: 10, fuga: 11, foo: 12, bar: 13, baz: 14 }, 1, 3), { fuga: 11, foo: 12, bar: 13 })

let m = {}
m = objAddCount(m, 'hoge')
t.eq({ hoge: 0 }, m)
m = objAddCount(m, 'fuga')
t.eq({ hoge: 1, fuga: 0 }, m)
m = objAddCount(m, 'fuga')
t.eq({ fuga: 1, hoge: 0 }, m)
m = objAddCount(m, 'fuga')
t.eq({ fuga: 1, hoge: 0 }, m)
m = objAddCount(m, 'hoge')
t.eq({ hoge: 1, fuga: 0 }, m)
m = objAddCount(m, 'foo')
t.eq({ hoge: 2, fuga: 1, foo: 0 }, m)
m = objAddCount(m, 'foo')
t.eq({ hoge: 2, foo: 1, fuga: 0 }, m)
m = objAddCount(m, 'fuga')
t.eq({ hoge: 2, fuga: 1, foo: 0 }, m)
m = objAddCount(m, 'hoge')
t.eq({ hoge: 2, fuga: 1, foo: 0 }, m)
m = objAddCount(m, 'bar')
t.eq({ hoge: 3, fuga: 2, foo: 1, bar: 0 }, m)
