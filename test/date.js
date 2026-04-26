import * as utils from '../src/date.js'
Object.assign(globalThis, utils)
import Test from '../src/test.js'

const t = new Test()

t.eq('1975-06-12', dateAdd('1975-06-11', 1))
t.eq('1975-07-11', dateAdd('1975-06-11', 1, 'month'))
t.eq('1976-06-11', dateAdd('1975-06-11', 1, 'year'))
t.eq('1975-06-10', dateAdd('1975-06-11', -1))

t.eq('13:34:56', timeAdd('12:34:56', 1))
t.eq('12:35:56', timeAdd('12:34:56', 1, 'minute'))
t.eq('12:34:57', timeAdd('12:34:56', 1, 'second'))

t.eq('1975-06-11 01:00:00', datetimeAdd('1975-06-11 00:00:00', 1))

t.eq(30, dateDiff('1975-07-11', '1975-06-11'))
t.eq(-1, dateDiff('1975-06-11', '1975-06-12'))
t.eq(-24, dateDiff('1975-06-11', '1975-06-12', 'hour'))

t.eq('1975-06-01', dateStartOf('1975-06-11'))
t.eq('00:00:00', timeStartOf('00:00:00', 'hour'))
t.eq('1975-06-11 00:00:00', datetimeStartOf('1975-06-11 00:00:00', 'day'))
t.eq('1975-01-01', dateStartOf('1975-06-11', 'year'))

t.eq('1975-06-30', dateEndOf('1975-06-11'))
t.eq('00:59:59', timeEndOf('00:00:00', 'hour'))
t.eq('1975-06-11 23:59:59', datetimeEndOf('1975-06-11 00:00:00', 'day'))
t.eq('1975-12-31', dateEndOf('1975-06-11', 'year'))
t.eq('1976-02-29', dateEndOf('1976-02-01', 'month'))

t.eq(5, dayW('1976-06-11'))
