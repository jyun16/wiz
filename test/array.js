import * as arrayUtils from '../src/array.js'
Object.assign(globalThis, arrayUtils)
import Test from '../src/test.js'

const t = new Test()

t.eq([1, 3], arrayRemove([1, 2, 3], 2))
t.eq(1, arrayChoice([1, 1, 1]))
t.eq([1, 2, 3, 4], arrayConcat([1, 2], [3, 4]))
t.eq([1, 2, 3], arrayUniq([1, 2, 2, 3]))
t.eq({ 0: true, 1: true, 2: true }, array2obj([0, 1, 2]))
t.eq({ 1: { id: 1, name: 'a' } }, arrayKeyBy([{ id: 1, name: 'a' }], 'id'))
t.eq(['a', 'b'], arrayPick([{ name: 'a' }, { name: 'b' }], 'name'))
t.eq(['foo', 'hoge', 'fuga', 'bar'], arrayMove(['hoge', 'fuga', 'foo', 'bar'], 2, 0))
t.eq([1, 2], arraySlice([0, 1, 2, 3], 1, 2))
t.eq([[0, 1], [2, 3]], arrayChunk([0, 1, 2, 3], 2))
t.eq([[1], [2], [3]], arraySplit([1, 0, 2, 0, 3], v => v === 0))
t.eq([[0, 3, 6, 9], [1, 4, 7], [2, 5, 8]], arrayDistribute([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 3))
t.eq(['a', 'b'], arrayTrim([' a ', 'b ']))
t.eq({ added: [5, 6], removed: [2, 4] }, arrayDiff([1, 2, 3, 4], [1, 3, 5, 6]))
t.eq([1], arrayWrap(1))
t.eq([1], arrayWrap([1]))
t.eq([1, 2, 3], arrayRange(1, 3))

class Hoge {
  constructor() {
    this.list = ['HOGE 1', 'HOGE 2']
    return arrayable(this)
  }
  csv() { return this.list.join(', ') }
}

const hoge = new Hoge()
t.eq('HOGE 1', hoge[0])
t.eq('HOGE 2', hoge[1])
t.eq(undefined, hoge[2])
t.eq(2, hoge.length)
t.eq('HOGE 1, HOGE 2', hoge.csv())
