import { d, expandRange, isMain } from '../src/index.js'
import {isPublicHoliday, isHoliday, getCalendarDays } from '../src/calendar.js'
import Test from '../src/test.js'

const t = new Test()
t.true(isPublicHoliday('2026-05-03'))
t.true(isHoliday('2026-05-02'))
t.false(isPublicHoliday('2026-05-02'))
t.false(isPublicHoliday('2026-05-07'))
t.eq([ [ 3, '29..31' ], [ 4, '1..30' ], [ 5, '1..9' ] ], getCalendarDays(2026, 4))
t.eq([ [ 12, '28..31' ], [ 1, '1..31' ], [ 2,'1..7' ] ], getCalendarDays(2026)[0])
t.eq([ [ 3, '29..31' ], [ 4, '1..30' ], [ 5, '1..9' ] ], getCalendarDays(2026)[3])
