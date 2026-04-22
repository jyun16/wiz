import _ from 'lodash'
import {
	array2map, range, splitArray, arrayDiff, arrayMove, arrayable
} from '../src/index.js'
import Test from '../src/test.js'

const t = new Test()

t.eq(array2map(range(3)), { 0: true, 1: true, 2: true })
t.eq(splitArray(_.range(10), 3), [ [ 0, 3, 6, 9 ], [ 1, 4, 7 ], [ 2, 5, 8 ] ])

t.eq(arrayDiff([ 1, 2, 3, 4 ], [ 1, 3, 5, 6 ]), { added: [ 5, 6 ], removed: [ 2, 4 ] })
t.eq(arrayMove([ 'hoge', 'fuga', 'foo', 'bar' ], 2, 0), [ 'foo', 'hoge', 'fuga', 'bar' ])

class Hoge {
	constructor() {
		this.list = [ 'HOGE 1', 'HOGE 2' ]
		return arrayable(this)
	}
	csv() {
		return this.list.join(', ')
	}
}

const hoge = new Hoge()
t.eq(hoge[0], 'HOGE 1')
t.eq(hoge[1], 'HOGE 2')
t.eq(hoge[2], null)
t.eq(hoge.length, 2)
t.eq(hoge.csv(), 'HOGE 1, HOGE 2')
