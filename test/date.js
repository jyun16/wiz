import { d } from '../src/index.js'
import Test from '../src/test.js'
import { ymd, ymdStr } from '../src/date.js'

const t = new Test()
d(ymdStr())
d(ymd())
